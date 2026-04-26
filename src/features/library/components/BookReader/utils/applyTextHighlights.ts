import type { BookHighlight } from '@/domain/library/types';
import { markBg } from './constants';

/** Injeta <mark> tags em torno dos textos destacados no conteúdo markdown.
 * Ordena do maior pro menor pra evitar marks aninhados.
 */
export function applyTextHighlights(content: string, highlights: BookHighlight[]): string {
  const withText = highlights.filter(h => h.selected_text);
  const sorted = [...withText].sort((a, b) => (b.selected_text?.length ?? 0) - (a.selected_text?.length ?? 0));

  let result = content;
  for (const h of sorted) {
    const sel = h.selected_text!;
    const cls = markBg[h.color];
    const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(`(?<!<mark[^>]*>[^<]*)${escaped}`, 'g'),
      `<mark class="${cls}">${sel}</mark>`,
    );
  }
  return result;
}
