export interface IStorageService {
  uploadFile(file: File, folder?: string, customFileName?: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
}
