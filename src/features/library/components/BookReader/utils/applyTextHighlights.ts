import type { BookHighlight } from '@/domain/library/types';
import { markBg } from './constants';

/** Injeta <mark> no(s) text(o)s destacado(s).
 * Cada highlight marca SOMENTE a Nth ocorrência (occurrence_index, default 1).
 * Sort do maior pro menor pra evitar marks aninhados.
 */
export function applyTextHighlights(content: string, highlights: BookHighlight[]): string {
  const withText = highlights.filter(h => h.selected_text);
  const sorted = [...withText].sort((a, b) => (b.selected_text?.length ?? 0) - (a.selected_text?.length ?? 0));

  let result = content;
  for (const h of sorted) {
    const sel = h.selected_text!;
    const cls = markBg[h.color];
    const target = h.occurrence_index && h.occurrence_index > 0 ? h.occurrence_index : 1;
    const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Conta ocorrências fora de marks já existentes
    const re = new RegExp(`(?<!<mark[^>]*>[^<]*)${escaped}`, 'g');
    let occCount = 0;
    result = result.replace(re, match => {
      occCount++;
      if (occCount === target) return `<mark class="${cls}">${sel}</mark>`;
      return match;
    });
  }
  return result;
}
