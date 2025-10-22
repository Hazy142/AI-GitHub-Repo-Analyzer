import { Injectable } from '@angular/core';

export interface RepoFile {
  path: string;
  content: string;
}

@Injectable()
export class GithubService {
  private readonly GITHUB_API_BASE = 'https://api.github.com/repos';

  parseGithubUrl(url: string): { owner: string; repo: string } {
    try {
      const urlObject = new URL(url);
      if (urlObject.hostname !== 'github.com') {
        throw new Error('Not a GitHub URL');
      }
      const pathParts = urlObject.pathname.split('/').filter(p => p);
      if (pathParts.length < 2) {
        throw new Error('Invalid GitHub repository URL format');
      }
      const [owner, repo] = pathParts;
      return { owner, repo };
    } catch (e) {
      throw new Error('Invalid URL provided.');
    }
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async performFetch(url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> {
    try {
      const response = await fetch(url, options);
      // Retry on 5xx server errors, which can be transient
      if (response.status >= 500 && retries > 0) {
        console.warn(`Request to ${url} failed with status ${response.status}. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.performFetch(url, options, retries - 1, backoff * 2);
      }
      return response;
    } catch (e) {
      // Retry on generic network errors
      if (e instanceof TypeError && e.message === 'Failed to fetch' && retries > 0) {
          console.warn(`Request to ${url} failed with a network error. Retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          return this.performFetch(url, options, retries - 1, backoff * 2);
      }
      
      // If all retries fail for a network error, throw the user-friendly message
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        throw new Error(
          'A network error occurred trying to contact the GitHub API. This could be due to:\n' +
          '1. No internet connection.\n' +
          '2. A browser extension (like an ad-blocker) blocking the request.\n' +
          '3. A firewall or proxy blocking the connection.\n' +
          '4. A Cross-Origin (CORS) issue.\n\n' +
          'Please check your browser\'s developer console (F12) for more specific error details.'
        );
      }
      // Re-throw other unexpected errors
      throw e;
    }
  }

  private async getDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
    const url = `${this.GITHUB_API_BASE}/${owner}/${repo}`;
    const response = await this.performFetch(url, { headers: this.getHeaders(token) });
    
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error(`GitHub API rate limit exceeded. Please provide a Personal Access Token to continue.`);
        }
        if (response.status === 404) {
            throw new Error(`Repository not found. It may be private or spelled incorrectly.`);
        }
         if (response.status === 401) {
            throw new Error(`The provided GitHub token is invalid or expired.`);
        }
        throw new Error(`Failed to fetch repository details (${response.status} ${response.statusText}).`);
    }
    
    const repoDetails = await response.json();
    if (!repoDetails.default_branch) {
        throw new Error(`Could not determine the default branch for the repository.`);
    }
    return repoDetails.default_branch;
  }
  
  private async getLatestCommitTreeSha(owner: string, repo: string, branch: string, token?: string): Promise<string> {
    const url = `${this.GITHUB_API_BASE}/${owner}/${repo}/branches/${branch}`;
    const response = await this.performFetch(url, { headers: this.getHeaders(token) });
    if (!response.ok) {
      throw new Error(`Failed to get details for branch '${branch}': ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.commit.commit.tree.sha;
  }

  private async getRecursiveTree(owner: string, repo: string, treeSha: string, token?: string): Promise<{ path: string, sha: string }[]> {
    const url = `${this.GITHUB_API_BASE}/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
    const response = await this.performFetch(url, { headers: this.getHeaders(token) });
    if (!response.ok) {
        throw new Error(`Failed to fetch repository file tree: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.truncated) {
        console.warn("Repository tree is too large and has been truncated by the GitHub API. Some files may be missing from the analysis.");
    }
    return data.tree
        .filter((item: any) => item.type === 'blob')
        .map((item: any) => ({ path: item.path, sha: item.sha }));
  }
  
  private async getBlobContent(owner: string, repo: string, blobSha: string, path: string, token?: string): Promise<string | null> {
    const url = `${this.GITHUB_API_BASE}/${owner}/${repo}/git/blobs/${blobSha}`;
    const response = await this.performFetch(url, { headers: this.getHeaders(token) });
    if (!response.ok) {
        console.warn(`Failed to fetch content for ${path}. Status: ${response.status}`);
        return null;
    }
    const data = await response.json();
    if (data.encoding !== 'base64') {
        console.warn(`Unsupported encoding '${data.encoding}' for ${path}, skipping.`);
        return null;
    }
    try {
        return atob(data.content);
    } catch (e) {
        console.warn(`Failed to decode content for ${path}, likely a binary file. Skipping.`);
        return null;
    }
  }

  async getRepoFiles(owner: string, repo: string, token?: string): Promise<RepoFile[]> {
    try {
      const branch = await this.getDefaultBranch(owner, repo, token);
      const treeSha = await this.getLatestCommitTreeSha(owner, repo, branch, token);
      const fileTree = await this.getRecursiveTree(owner, repo, treeSha, token);
      
      const allFiles: RepoFile[] = [];
      const batchSize = 20;

      for (let i = 0; i < fileTree.length; i += batchSize) {
        const batch = fileTree.slice(i, i + batchSize);
        const promises = batch.map(async (file) => {
          const content = await this.getBlobContent(owner, repo, file.sha, file.path, token);
          if (content !== null) {
            return { path: file.path, content };
          }
          return null;
        });
        
        const batchResults = await Promise.all(promises);
        const validFiles = batchResults.filter((f): f is RepoFile => f !== null);
        allFiles.push(...validFiles);
      }
      
      return allFiles;

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`Could not download repository. Reason: ${errorMessage}`);
    }
  }
}