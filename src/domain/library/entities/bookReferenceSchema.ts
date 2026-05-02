import { z } from 'zod';
import type { BookReference, BookAuthor, ReferenceType } from '@/domain/library/types';

const REFERENCE_TYPES: [ReferenceType, ...ReferenceType[]] = [
  'book', 'article', 'website', 'chapter_in_book', 'thesis',
];

/** Zod schema para BookAuthor — sobrenome obrigatório, nome próprio opcional. */
export const bookAuthorSchema = z.object({
  surname: z.string()
    .trim()
    .min(1, 'Sobrenome é obrigatório')
    .max(120, 'Máximo 120 caracteres'),
  given_name: z.string()
    .trim()
    .max(200, 'Máximo 200 caracteres')
    .default(''),
});

/** Validação ISBN — 10 ou 13 dígitos com hífens permitidos. */
const isbnSchema = z.string()
  .trim()
  .regex(/^[\d-]{10,17}X?$/i, 'ISBN inválido (use 10 ou 13 dígitos com hífens)')
  .optional()
  .or(z.literal(''));

/** DOI — formato 10.XXXX/algo */
const doiSchema = z.string()
  .trim()
  .regex(/^10\.\d{4,9}\/[\w\-.;()\/:]+$/i, 'DOI inválido (formato: 10.XXXX/identificador)')
  .optional()
  .or(z.literal(''));

const urlSchema = z.string()
  .trim()
  .url('URL inválida (precisa começar com http:// ou https://)')
  .optional()
  .or(z.literal(''));

const yearSchema = z.number()
  .int('Ano deve ser número inteiro')
  .min(0, 'Ano inválido')
  .max(2099, 'Ano inválido')
  .optional();

const editionSchema = z.number()
  .int('Edição deve ser número inteiro')
  .min(1, 'Edição mínima: 1')
  .max(99, 'Edição máxima: 99')
  .optional();

/** Schema completo de BookReference. */
export const bookReferenceSchema = z.object({
  id: z.string(),
  type: z.enum(REFERENCE_TYPES),
  authors: z.array(bookAuthorSchema)
    .min(1, 'Adicione pelo menos um autor')
    .max(20, 'Máximo 20 autores'),
  title: z.string().trim().min(1, 'Título obrigatório').max(500),
  subtitle: z.string().trim().max(500).optional().or(z.literal('')),
  publisher: z.string().trim().max(200).optional().or(z.literal('')),
  institution: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  year: yearSchema,
  edition: editionSchema,
  pages: z.string().trim().regex(/^(\d+(-\d+)?)?$/, 'Use formato 45 ou 45-67').optional().or(z.literal('')),
  journal: z.string().trim().max(200).optional().or(z.literal('')),
  volume: z.string().trim().max(20).optional().or(z.literal('')),
  issue: z.string().trim().max(20).optional().or(z.literal('')),
  url: urlSchema,
  access_date: z.string().trim().optional().or(z.literal('')),
  doi: doiSchema,
  isbn: isbnSchema,
});

export type BookReferenceFormData = z.infer<typeof bookReferenceSchema>;

/** Validate + retorna lista de erros amigáveis (path → message). */
export function validateBookReference(ref: BookReference): Record<string, string> {
  const result = bookReferenceSchema.safeParse(ref);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
}

/** Migração: converte autores formato antigo (string) para novo (BookAuthor). */
export function migrateAuthorString(s: string): BookAuthor {
  // Formato antigo: "SOBRENOME, Nome" ou "Nome Sobrenome"
  const trimmed = s.trim();
  if (!trimmed) return { surname: '', given_name: '' };
  if (trimmed.includes(',')) {
    const [surname, ...rest] = trimmed.split(',');
    return {
      surname: surname.trim(),
      given_name: rest.join(',').trim(),
    };
  }
  // Sem vírgula: assume "Nome Sobrenome" — última palavra é sobrenome
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { surname: parts[0], given_name: '' };
  return {
    surname: parts[parts.length - 1],
    given_name: parts.slice(0, -1).join(' '),
  };
}
