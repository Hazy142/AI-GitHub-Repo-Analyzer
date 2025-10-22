import { Injectable } from '@angular/core';
import { ReimplementedFile } from './gemini.service';

declare const JSZip: any;

@Injectable()
export class ZipService {
  async createAndDownloadZip(files: ReimplementedFile[], zipName: string): Promise<void> {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip library not found. Make sure it is included in your index.html.');
      return;
    }
    
    const zip = new JSZip();

    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${zipName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}
