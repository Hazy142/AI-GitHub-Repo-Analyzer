import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { RepoFile } from './github.service';

export interface ReimplementedFile {
  path: string;
  content: string;
}

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async selectRelevantFiles(filePaths: string[]): Promise<string[]> {
    const fileList = filePaths.join('\n');
    const prompt = `From the following list of file paths from a GitHub repository, select up to 50 of the most relevant files for a comprehensive code review.

Your goal is to build a complete picture of the project's application source code.

Prioritize:
- Core application logic (e.g., services, main business logic).
- UI components and their structure.
- Entry points (e.g., main.ts, index.js, app.py).
- Key configuration files that define project structure and dependencies (e.g., package.json, pom.xml, webpack.config.js, tsconfig.json).
- API definitions or routes.
- Build scripts.

Explicitly Exclude:
- Any directories starting with a dot (e.g., .vscode, .github).
- Any directories named 'addon' or 'addons'.
- Lock files (package-lock.json, yarn.lock, etc.).
- Generated code or build artifacts (e.g., anything in a 'dist' or 'build' folder).
- Non-essential documentation (ignore most .md files, except critical ones like README.md if it contains setup info).
- Image, video, or font assets.
- Test files.
- Git-related files (.gitignore, .gitattributes).

Respond ONLY with a JSON array of strings, where each string is a file path to include in the analysis.

File list:
${fileList}`;

    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  }
  
  async analyzeCode(files: RepoFile[]): Promise<AsyncIterable<GenerateContentResponse>> {
    const concatenatedCode = files
      .map(file => `// FILE: ${file.path}\n\n${file.content}\n\n// END OF FILE: ${file.path}\n\n---\n\n`)
      .join('');

    const prompt = `You are a world-class principal software engineer conducting a deep and thorough code review. The following source code is from a single project. Analyze it meticulously and provide a comprehensive report in markdown format. Your report must be exceptionally detailed and actionable.

The report must contain these exact sections:

1.  **Executive Summary**: A high-level overview of the project's purpose, its technological stack, and a summary of your key findings.

2.  **Detailed Architecture Review**: A deep dive into the project's architecture. Discuss the overall design, data flow, state management, component interaction, and separation of concerns. Evaluate how well the architecture supports the project's goals.

3.  **Error Handling & Debugging Analysis**: Scrutinize the code for its robustness. Identify potential bugs, race conditions, null pointer exceptions, and areas with weak or non-existent error handling. Suggest specific debugging strategies for the identified issues and how to improve logging and error reporting.

4.  **Security Vulnerabilities**: Perform a security audit. Check for common vulnerabilities such as insecure dependencies (from package.json etc.), potential for injection attacks, improper handling of secrets, and other common security anti-patterns.

5.  **Performance Bottlenecks**: Analyze the code for potential performance issues. Look for inefficient algorithms, memory leaks, unnecessary re-renders in the frontend, or slow database queries.

6.  **Actionable Modernization Plan**: Provide a detailed, step-by-step plan to refactor and improve the project. Suggest specific code changes, library updates, or architectural modifications to align the project with modern best practices, improve maintainability, and resolve the issues identified in previous sections.

---START OF CODE---

${concatenatedCode}
---END OF CODE---
`;

    return this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
  }

  async reimplementCode(files: RepoFile[], analysis: string): Promise<AsyncIterable<GenerateContentResponse>> {
    const concatenatedCode = files
      .map(file => `// FILE: ${file.path}\n\n${file.content}\n\n// END OF FILE: ${file.path}\n\n---\n\n`)
      .join('');
      
    const prompt = `You are an AI programming agent. Your task is to re-implement EVERY SINGLE FILE provided in the 'ORIGINAL CODE' section below, applying the improvements from the 'Actionable Modernization Plan'.

You MUST generate a JSON object for each of the original files. Do not omit any files. The output must be a complete, 1-to-1 replacement of the provided codebase, but modernized. For every file listed under \`---START OF ORIGINAL CODE---\`, you must output a corresponding JSON object with its new, improved content.

IMPORTANT STREAMING REQUIREMENT:
Your entire response MUST be a stream of JSON objects using the JSON Lines format. This means EACH line of your output must be a single, complete, and valid JSON object. Do NOT use pretty-printing. Each line is an independent JSON object.

- DO NOT use markdown fences like \`\`\`json.
- DO NOT format the JSON to be human-readable across multiple lines. It must be a single line per file.

Correct format for each line:
{"path": "src/app.component.ts", "content": "import { ... }\\n\\n@Component({...})\\nexport class AppComponent {...}"}
{"path": "src/app.component.html", "content": "<div>...</div>"}

Each JSON object represents a single file and MUST have two string properties:
1. "path": The full file path.
2. "content": The full file content, with newlines escaped as \\n.

Ensure the new implementation is a complete, runnable project based on the files provided.

---START OF ORIGINAL CODE---

${concatenatedCode}

---START OF MODERNIZATION PLAN---

${analysis}
`;

    return this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
  }
}