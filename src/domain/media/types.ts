/**
 * Registro de arquivos em R2 indexado por hash SHA-256.
 * Usado para dedupe e galeria reutilizável.
 */
export type MediaKind = 'image' | 'video' | 'audio';

export interface MediaAsset {
  id: string;
  /** SHA-256 do conteúdo — usado como chave de dedupe. */
  hash: string;
  /** URL pública R2. */
  url: string;
  kind: MediaKind;
  /** mime type (ex: image/png, video/mp4). */
  mime: string;
  /** Bytes. */
  size: number;
  /** Nome original do arquivo (opcional, ajuda busca). */
  name?: string;
  uploaded_by: string;
  created_at: string;
}
