import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { IStorageService } from "./IStorageService";

export class R2StorageService implements IStorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = (process.env.R2_BUCKET_NAME || '').replace(/"/g, '').trim();
    const rawUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/"/g, '').trim();
    this.publicUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    
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

  /**
   * Faz upload de um arquivo para o R2 com estrutura organizada:
   * [origin]/[type]/[year]/[month]/[day]/[timestamp]-[sanitized-name]
   */
  async uploadFile(
    file: File | any, 
    type: string = 'uploads', 
    origin: string = 'cms',
    customFileName?: string
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const timestamp = Date.now();
    
    // Sanitização rigorosa do nome do arquivo
    // Remove qualquer tentativa de Path Traversal ou extensões duplas perigosas
    const originalName = file.name || 'unnamed_file';
    const extension = originalName.split('.').pop()?.toLowerCase() || '';
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('_')
      .replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const sanitizedName = `${nameWithoutExt}.${extension}`;
    
    // Montagem do caminho: origem/tipo/ano/mes/dia/
    const folderPath = `${origin}/${type}/${year}/${month}/${day}`;
    
    const fileName = customFileName 
      ? `${folderPath}/${customFileName}` 
      : `${folderPath}/${timestamp}-${sanitizedName}`;
    
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
      ContentType: file.type || 'application/octet-stream',
    });

    await this.client.send(command);
    
    return `${this.publicUrl}/${fileName}`;
  }

  async deleteFile(url: string): Promise<void> {
    // Extrair a chave do bucket a partir da URL (remove o domínio publico)
    const key = url.replace(`${this.publicUrl}/`, '');
    
    // Segurança: Garantir que não estamos tentando deletar fora do domínio permitido
    if (key.startsWith('http')) {
       throw new Error('URL de exclusão inválida');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Lista arquivos de uma pasta específica de forma recursiva (para lidar com a estrutura de data)
   */
  async listFiles(prefix: string): Promise<string[]> {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
    });

    const result = await this.client.send(command);
    
    return (result.Contents || [])
      .map((item) => item.Key || '')
      .filter((key) => !key.endsWith('/')) // Remove as próprias "pastas" (objetos de prefixo)
      .map((key) => `${this.publicUrl}/${key}`);
  }
}

export const storageService = new R2StorageService();
