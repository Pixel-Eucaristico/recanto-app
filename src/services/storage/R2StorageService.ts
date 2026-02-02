import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { IStorageService } from "./IStorageService";

export class R2StorageService implements IStorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = (process.env.R2_BUCKET_NAME || '').replace(/"/g, '').trim();
    this.publicUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/"/g, '').trim();
    
    const accountId = (process.env.R2_ACCOUNT_ID || '').replace(/"/g, '').trim();
    const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').replace(/"/g, '').trim();
    const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').replace(/"/g, '').trim();

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    console.log(`[R2StorageService] Inicializando com endpoint: ${endpoint} (Account ID: ${accountId.substring(0, 4)}...)`);
    
    this.client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: File | any, folder: string = 'uploads', customFileName?: string): Promise<string> {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    
    // Se um nome personalizado for fornecido, usa ele. Caso contrário, usa o padrão.
    const fileName = customFileName 
      ? `${folder}/${customFileName}` 
      : `${folder}/${timestamp}-${sanitizedName}`;
    
    // Ensure we have a Buffer/Uint8Array for S3 upload in Node.js
    let body;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      body = Buffer.from(arrayBuffer);
    } else {
      body = file;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: body,
      ContentType: file.type || 'image/jpeg',
    });

    await this.client.send(command);
    
    return `${this.publicUrl}/${fileName}`;
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }
}

export const storageService = new R2StorageService();
