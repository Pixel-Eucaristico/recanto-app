/**
 * Maior nível de heading usado no texto (1..6, 0 se nenhum).
 * Usado pra mostrar progressivamente H4/H5/H6 no toolbar.
 */
export function detectMaxHeadingLevel(text: string): number {
  if (!text) return 0;
  let max = 0;
  const re = /^(#{1,6})\s/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1].length > max) max = m[1].length;
    if (max === 6) break;
  }
  return max;
}

/**
 * Inspeciona o texto + posição do cursor pra determinar quais comandos do toolbar
 * devem aparecer "ativos" (texto atual usa aquela formatação).
 *
 * Retorna nomes de commands (compatíveis com `data-name` dos botões do MDEditor).
 */
export function detectActiveCommands(text: string, cursor: number): Set<string> {
  const active = new Set<string>();
  if (!text) return active;

  // Linha atual (entre quebras de linha)
  const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
  const lineEndRel = text.indexOf('\n', cursor);
  const lineEnd = lineEndRel === -1 ? text.length : lineEndRel;
  const line = text.slice(lineStart, lineEnd);

  // Headings
  const h = /^(#{1,6})\s/.exec(line);
  if (h) {
    const level = h[1].length;
    active.add('title');
    active.add(`title${level}`);
  }

  // Quote
  if (/^>\s/.test(line)) active.add('quote');

  // Listas (precisa testar checklist antes da unordered)
  if (/^[-*+]\s\[[\sxX]\]/.test(line)) {
    active.add('checked-list');
    active.add('checked');
  } else if (/^[-*+]\s/.test(line)) {
    active.add('unordered-list');
    active.add('unordered');
  } else if (/^\d+\.\s/.test(line)) {
    active.add('ordered-list');
    active.add('ordered');
  }

  // Bloco de código
  // Conta cercas ``` antes do cursor — ímpar = dentro
  const fencesBefore = (text.slice(0, cursor).match(/```/g) ?? []).length;
  if (fencesBefore % 2 === 1) active.add('codeBlock');

  // Marcadores inline em volta da posição
  if (isWrappedAt(text, cursor, '**')) active.add('bold');
  if (isWrappedAt(text, cursor, '~~')) active.add('strikethrough');
  // Italic: precisa ser * ou _ isolado (não **)
  if (isInlineItalicAt(text, cursor)) active.add('italic');
  // Code inline: ` (não ```)
  if (isInlineCodeAt(text, cursor)) active.add('code');

  // Alinhamento — cursor dentro de <div style="text-align: X">
  const align = detectAlignment(text, cursor);
  if (align) active.add(`align-${align}`);

  return active;
}

function isWrappedAt(text: string, cursor: number, marker: string): boolean {
  const before = text.slice(0, cursor);
  const after = text.slice(cursor);
  // Conta ocorrências antes — ímpar = dentro
  let count = 0;
  let i = 0;
  while ((i = before.indexOf(marker, i)) !== -1) {
    count++;
    i += marker.length;
  }
  if (count % 2 !== 1) return false;
  return after.includes(marker);
}

function isInlineItalicAt(text: string, cursor: number): boolean {
  const before = text.slice(0, cursor);
  // Conta asteriscos isolados (não ** nem ***)
  let count = 0;
  for (let i = 0; i < before.length; i++) {
    if (before[i] !== '*') continue;
    const prev = before[i - 1];
    const next = before[i + 1];
    if (prev === '*' || next === '*') continue;
    count++;
  }
  return count % 2 === 1;
}

function isInlineCodeAt(text: string, cursor: number): boolean {
  const before = text.slice(0, cursor);
  let count = 0;
  for (let i = 0; i < before.length; i++) {
    if (before[i] !== '`') continue;
    // Pula cercas ```
    if (before[i + 1] === '`' && before[i + 2] === '`') {
      i += 2;
      continue;
    }
    count++;
  }
  return count % 2 === 1;
}

function detectAlignment(text: string, cursor: number): 'left' | 'center' | 'right' | null {
  const openRe = /<div\s+style="text-align:\s*(left|center|right)"[^>]*>/gi;
  const closeRe = /<\/div>/gi;

  // Encontra o último <div style="text-align..."> antes do cursor
  let lastOpen: { idx: number; align: 'left' | 'center' | 'right' } | null = null;
  let m: RegExpExecArray | null;
  openRe.lastIndex = 0;
  while ((m = openRe.exec(text)) !== null) {
    if (m.index >= cursor) break;
    lastOpen = { idx: m.index, align: m[1].toLowerCase() as 'left' | 'center' | 'right' };
  }
  if (!lastOpen) return null;

  // Verifica que não tem </div> entre o open e cursor
  closeRe.lastIndex = lastOpen.idx;
  const closeMatch = closeRe.exec(text);
  if (closeMatch && closeMatch.index < cursor) return null;

  return lastOpen.align;
}
