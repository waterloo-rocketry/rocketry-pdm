export interface StoredFile {
    provider: string;
    path: string;
    externalFileId?: string;
    url?: string;
  }
  
  export interface UploadFileInput {
    file: File;
    jobId: string;
    filename: string;
  }
  
  export interface FileStorage {
    upload(input: UploadFileInput): Promise<StoredFile>;
  
    getFileUrl(path: string): Promise<string>;
  
    delete(path: string): Promise<void>;
  }