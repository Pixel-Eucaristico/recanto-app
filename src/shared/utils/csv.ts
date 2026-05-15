/**
 * CSV utils — geração e download de CSVs simples client-side.
 * Sem libs externas. Compatível com Excel (BOM UTF-8 + separador ,).
 */

/** Escape conforme RFC 4180: aspas duplas + envolve em "..." se contém , " ou \n. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: Array<Record<string, unknown>>, headers?: string[]): string {
  if (rows.length === 0) return '';
  const cols = headers ?? Object.keys(rows[0]);
  const headerLine = cols.map(escapeCell).join(',');
  const lines = rows.map(r => cols.map(c => escapeCell(r[c])).join(','));
  return [headerLine, ...lines].join('\r\n');
}

/** Dispara download client-side de string como arquivo. BOM UTF-8 pra Excel ler acentos. */
export function downloadCsv(filename: string, content: string): void {
  const bom = '﻿';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
