import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { GithubService, RepoFile } from './services/github.service';
import { GeminiService, ReimplementedFile } from './services/gemini.service';
import { ZipService } from './services/zip.service';

type AppState = 'idle' | 'loading' | 'analyzed' | 'reimplemented' | 'error';

interface StatusStep {
  id: number;
  text: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  providers: [GithubService, GeminiService, ZipService],
})
export class AppComponent {
  private readonly githubService = inject(GithubService);
  private readonly geminiService = inject(GeminiService);
  private readonly zipService = inject(ZipService);

  repoUrl = signal('https://github.com/angular/angular');
  githubToken = signal('');
  appState = signal<AppState>('idle');
  errorMessage = signal<string | null>(null);
  analysisResult = signal<string | null>(null);
  reimplementedFiles = signal<ReimplementedFile[] | null>(null);
  fetchedFiles = signal<RepoFile[] | null>(null);
  expandedFile = signal<string | null>(null);

  statusSteps = signal<StatusStep[]>([
    { id: 1, text: 'Download and read all repository files', status: 'pending' },
    { id: 2, text: 'AI selects relevant files for analysis', status: 'pending' },
    { id: 3, text: 'AI analyzes code architecture', status: 'pending' },
    { id: 4, text: 'AI re-implements the project', status: 'pending' },
    { id: 5, text: 'Ready for download', status: 'pending' },
  ]);

  async onAnalyzeRepo(): Promise<void> {
    const url = this.repoUrl();
    const token = this.githubToken();
    if (!url) {
      this.handleError('Please enter a valid GitHub repository URL.');
      return;
    }

    this.resetState();
    this.appState.set('loading');

    try {
      const { owner, repo } = this.githubService.parseGithubUrl(url);

      this.updateStatus(1, 'in-progress');
      const allFiles = await this.githubService.getRepoFiles(owner, repo, token);
      const allFilePaths = allFiles.map(f => f.path);
      this.updateStatus(1, 'complete');
      
      if (allFiles.length === 0) {
        this.handleError('Repository appears to be empty or contains no readable files.');
        return;
      }

      this.updateStatus(2, 'in-progress');
      const relevantFilePaths = await this.geminiService.selectRelevantFiles(allFilePaths);
      this.updateStatus(2, 'complete');

      // No need for a separate 'fetch content' step, just filter what we have
      const relevantFiles = allFiles.filter(f => relevantFilePaths.includes(f.path));
      this.fetchedFiles.set(relevantFiles);

      this.updateStatus(3, 'in-progress');
      const analysisStream = await this.geminiService.analyzeCode(relevantFiles);
      this.analysisResult.set(''); // Clear previous result before streaming
      for await (const chunk of analysisStream) {
        this.analysisResult.update(current => (current ?? '') + chunk.text);
      }
      this.updateStatus(3, 'complete');
      this.appState.set('analyzed');

      this.updateStatus(4, 'in-progress');
      this.reimplementedFiles.set([]); // Initialize as empty array for incremental updates
      const reimplementationStream = await this.geminiService.reimplementCode(relevantFiles, this.analysisResult()!);
      
      let buffer = '';
      for await (const chunk of reimplementationStream) {
        buffer += chunk.text;

        // Process as many complete JSON objects as we can find in the buffer
        while (true) {
          const objectStartIndex = buffer.indexOf('{');
          if (objectStartIndex === -1) {
            // No object start found in the buffer, so we can't process anything.
            // Clear buffer if it's just whitespace or markdown fences.
            if (!buffer.includes('}')) {
              buffer = buffer.replace(/`{3}(json)?/g, '').trim();
            }
            if (buffer.trim() === '') buffer = '';
            break; // Wait for more data
          }

          // Discard any text before the first opening brace (e.g., ```json)
          buffer = buffer.substring(objectStartIndex);

          let braceCount = 0;
          let objectEndIndex = -1;
          for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === '{') {
              braceCount++;
            } else if (buffer[i] === '}') {
              braceCount--;
              if (braceCount === 0) {
                objectEndIndex = i;
                break;
              }
            }
          }

          if (objectEndIndex !== -1) {
            // A complete JSON object is found
            const objectStr = buffer.substring(0, objectEndIndex + 1);
            buffer = buffer.substring(objectEndIndex + 1); // Keep the remainder for the next iteration

            try {
              const file = JSON.parse(objectStr) as ReimplementedFile;
              if (file.path && file.content) {
                this.reimplementedFiles.update(files => [...(files ?? []), file]);
              }
            } catch (e) {
              console.warn('Failed to parse JSON object from stream:', objectStr, e);
            }
            // Continue the loop to check for more complete objects in the buffer
          } else {
            // The object is incomplete, break the while loop and wait for the next chunk
            break;
          }
        }
      }

      this.updateStatus(4, 'complete');
      
      this.updateStatus(5, 'complete');
      this.appState.set('reimplemented');

    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      this.handleError(message);
    }
  }
  
  onDownloadZip(): void {
    const files = this.reimplementedFiles();
    if (!files) return;

    const url = this.repoUrl();
    const repoName = url.split('/').pop() || 'reimplemented-project';

    this.zipService.createAndDownloadZip(files, repoName);
  }

  toggleFile(path: string): void {
    this.expandedFile.update(current => current === path ? null : path);
  }

  private resetState(): void {
    this.appState.set('idle');
    this.errorMessage.set(null);
    this.analysisResult.set(null);
    this.reimplementedFiles.set(null);
    this.fetchedFiles.set(null);
    this.expandedFile.set(null);
    this.statusSteps.set([ // Reset with new steps
        { id: 1, text: 'Download and read all repository files', status: 'pending' },
        { id: 2, text: 'AI selects relevant files for analysis', status: 'pending' },
        { id: 3, text: 'AI analyzes code architecture', status: 'pending' },
        { id: 4, text: 'AI re-implements the project', status: 'pending' },
        { id: 5, text: 'Ready for download', status: 'pending' },
    ]);
  }
  
  private updateStatus(id: number, status: 'in-progress' | 'complete' | 'error'): void {
    this.statusSteps.update(steps =>
      steps.map(step => (step.id === id ? { ...step, status } : step))
    );
  }
  
  private handleError(message: string): void {
    this.appState.set('error');
    this.errorMessage.set(message);
    const inProgressStep = this.statusSteps().find(s => s.status === 'in-progress');
    if (inProgressStep) {
      this.updateStatus(inProgressStep.id, 'error');
    }
  }
}