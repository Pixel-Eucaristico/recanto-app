/**
 * CitationFormatter — pure formatting logic, no I/O.
 * Implements StyleStrategy pattern: one method per citation style.
 */

import type { BookReference, CitationStyle } from '@/domain/library/types';

export class CitationFormatter {
  static format(ref: BookReference, style: CitationStyle): string {
    switch (style) {
      case 'abnt':    return CitationFormatter.formatAbnt(ref);
      case 'apa':     return CitationFormatter.formatApa(ref);
      case 'chicago': return CitationFormatter.formatChicago(ref);
    }
  }

  // ─── ABNT NBR 6023:2018 ────────────────────────────────────────────────────

  static formatAbnt(ref: BookReference): string {
    const authors = CitationFormatter.abntAuthors(ref.authors);
    const year = ref.year ? `${ref.year}` : 's.d.';
    const title = ref.title.toUpperCase();
    const subtitle = ref.subtitle ? `: ${ref.subtitle}` : '';

    if (ref.type === 'book') {
      const edition = ref.edition ? ` ${ref.edition} ed.` : '';
      const city = ref.city ?? 'S.l.';
      const publisher = ref.publisher ?? 's.n.';
      const isbn = ref.isbn ? ` ISBN ${ref.isbn}.` : '';
      return `${authors}. **${title}${subtitle}**.${edition} ${city}: ${publisher}, ${year}.${isbn}`;
    }

    if (ref.type === 'article') {
      const journal = ref.journal ? `**${ref.journal}**` : '';
      const vol = ref.volume ? `, v. ${ref.volume}` : '';
      const num = ref.issue ? `, n. ${ref.issue}` : '';
      const pages = ref.pages ? `, p. ${ref.pages}` : '';
      const doi = ref.doi ? ` DOI: ${ref.doi}.` : '';
      return `${authors}. ${ref.title}${subtitle}. ${journal}${vol}${num}${pages}, ${year}.${doi}`;
    }

    if (ref.type === 'website') {
      const access = ref.access_date ? ` Acesso em: ${ref.access_date}.` : '';
      const url = ref.url ? ` Disponível em: <${ref.url}>.` : '';
      return `${authors}. **${title}${subtitle}**. ${year}.${url}${access}`;
    }

    if (ref.type === 'chapter_in_book') {
      const city = ref.city ?? 'S.l.';
      const publisher = ref.publisher ?? 's.n.';
      const pages = ref.pages ? `, p. ${ref.pages}` : '';
      return `${authors}. ${ref.title}${subtitle}. In: ${journal(ref)}. **${ref.journal ?? ''}**. ${city}: ${publisher}, ${year}${pages}.`;
    }

    if (ref.type === 'thesis') {
      const city = ref.city ?? 'S.l.';
      const publisher = ref.publisher ?? 'Instituição';
      return `${authors}. **${title}${subtitle}**. ${year}. ${ref.pages ? ref.pages + ' f.' : ''} ${ref.edition ?? 'Dissertação (Mestrado)'} — ${publisher}, ${city}, ${year}.`;
    }

    return `${authors}. **${title}${subtitle}**. ${year}.`;
  }

  // ─── APA 7th Edition ──────────────────────────────────────────────────────

  static formatApa(ref: BookReference): string {
    const authors = CitationFormatter.apaAuthors(ref.authors);
    const year = ref.year ? `(${ref.year})` : '(s.d.)';
    const title = ref.type === 'book' || ref.type === 'thesis'
      ? `*${ref.title}${ref.subtitle ? ': ' + ref.subtitle : ''}*`
      : `${ref.title}${ref.subtitle ? ': ' + ref.subtitle : ''}`;

    if (ref.type === 'book') {
      const edition = ref.edition ? ` (${ref.edition} ed.)` : '';
      const publisher = ref.publisher ?? '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : ref.url ? ` ${ref.url}` : '';
      return `${authors} ${year}. ${title}${edition}. ${publisher}.${doi}`;
    }

    if (ref.type === 'article') {
      const journal = ref.journal ? `*${ref.journal}*` : '';
      const vol = ref.volume ? `, *${ref.volume}*` : '';
      const num = ref.issue ? `(${ref.issue})` : '';
      const pages = ref.pages ? `, ${ref.pages}` : '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
      return `${authors} ${year}. ${title}. ${journal}${vol}${num}${pages}.${doi}`;
    }

    if (ref.type === 'website') {
      const url = ref.url ? ` ${ref.url}` : '';
      const access = ref.access_date ? ` Retrieved ${ref.access_date}, from${url}` : url;
      return `${authors} ${year}. ${title}.${access}`;
    }

    if (ref.type === 'chapter_in_book') {
      const editor = ref.journal ? `In ${ref.journal} (Ed.)` : 'In';
      const pages = ref.pages ? ` (pp. ${ref.pages})` : '';
      const publisher = ref.publisher ?? '';
      return `${authors} ${year}. ${ref.title}. ${editor}, *${ref.subtitle ?? ''}*${pages}. ${publisher}.`;
    }

    if (ref.type === 'thesis') {
      const institution = ref.publisher ?? '';
      return `${authors} ${year}. ${title} [${ref.edition ?? 'Dissertação de Mestrado'}, ${institution}].`;
    }

    return `${authors} ${year}. ${title}.`;
  }

  // ─── Chicago 17th Edition (Author-Date) ────────────────────────────────────

  static formatChicago(ref: BookReference): string {
    const authors = CitationFormatter.chicagoAuthors(ref.authors);
    const year = ref.year ? `${ref.year}` : 'n.d.';
    const title = ref.type === 'book' || ref.type === 'thesis'
      ? `*${ref.title}${ref.subtitle ? ': ' + ref.subtitle : ''}*`
      : `"${ref.title}${ref.subtitle ? ': ' + ref.subtitle : ''}"`;

    if (ref.type === 'book') {
      const edition = ref.edition ? ` ${ref.edition} ed.` : '';
      const city = ref.city ?? '';
      const publisher = ref.publisher ?? '';
      return `${authors}. ${year}. ${title}.${edition} ${city}: ${publisher}.`;
    }

    if (ref.type === 'article') {
      const journal = ref.journal ? `*${ref.journal}*` : '';
      const vol = ref.volume ? ` ${ref.volume}` : '';
      const num = ref.issue ? `, no. ${ref.issue}` : '';
      const pages = ref.pages ? `: ${ref.pages}` : '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
      return `${authors}. ${year}. ${title}. ${journal}${vol}${num}${pages}.${doi}`;
    }

    if (ref.type === 'website') {
      const url = ref.url ? ` ${ref.url}` : '';
      const access = ref.access_date ? ` Accessed ${ref.access_date}.` : '';
      return `${authors}. ${year}. ${title}.${url}.${access}`;
    }

    return `${authors}. ${year}. ${title}.`;
  }

  // ─── Author formatters ─────────────────────────────────────────────────────

  /** ABNT: SOBRENOME, Nome; SOBRENOME2, Nome2 */
  private static abntAuthors(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length > 3) return `${authors[0]} et al.`;
    return authors.join('; ');
  }

  /** APA: Surname, F.; Surname2, F2. */
  private static apaAuthors(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length > 7) {
      return authors.slice(0, 6).join(', ') + ', . . . ' + authors[authors.length - 1];
    }
    if (authors.length === 1) return authors[0];
    const last = authors[authors.length - 1];
    return authors.slice(0, -1).join(', ') + ', & ' + last;
  }

  /** Chicago: First Last, First2 Last2, and First3 Last3 */
  private static chicagoAuthors(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return authors.slice(0, -1).join(', ') + ', and ' + authors[authors.length - 1];
  }

  /** Short in-text citation for ABNT: (SOBRENOME, year) */
  static inTextAbnt(ref: BookReference): string {
    const surname = ref.authors[0]?.split(',')[0] ?? ref.authors[0] ?? '';
    return `(${surname.toUpperCase()}, ${ref.year ?? 's.d.'})`;
  }

  /** Short in-text citation for APA: (Surname, year) */
  static inTextApa(ref: BookReference): string {
    const surname = ref.authors[0]?.split(',')[0] ?? ref.authors[0] ?? '';
    return `(${surname}, ${ref.year ?? 'n.d.'})`;
  }
}

function journal(ref: BookReference): string {
  return ref.journal ?? '';
}
