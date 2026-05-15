/**
 * CitationFormatter — pure formatting logic, no I/O.
 * Implements StyleStrategy pattern: one method per citation style.
 */

import type { BookReference, BookAuthor, CitationStyle } from '@/domain/library/types';

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
    const orgPart = CitationFormatter.publisherOrInstitution(ref);

    if (ref.type === 'book') {
      const edition = ref.edition ? ` ${ref.edition}. ed.` : '';
      const city = ref.city ?? 'S.l.';
      const isbn = ref.isbn ? ` ISBN ${ref.isbn}.` : '';
      return `${authors}. **${title}${subtitle}**.${edition} ${city}: ${orgPart || 's.n.'}, ${year}.${isbn}`;
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
      const pages = ref.pages ? `, p. ${ref.pages}` : '';
      return `${authors}. ${ref.title}${subtitle}. In: **${ref.journal ?? ''}**. ${city}: ${orgPart || 's.n.'}, ${year}${pages}.`;
    }

    if (ref.type === 'thesis') {
      const city = ref.city ?? 'S.l.';
      const inst = ref.institution ?? ref.publisher ?? 'Instituição';
      return `${authors}. **${title}${subtitle}**. ${year}. ${ref.pages ? ref.pages + ' f. ' : ''}Dissertação — ${inst}, ${city}, ${year}.`;
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
    const orgPart = CitationFormatter.publisherOrInstitution(ref);

    if (ref.type === 'book') {
      const edition = ref.edition ? ` (${ref.edition}th ed.)` : '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : ref.url ? ` ${ref.url}` : '';
      return `${authors} ${year}. ${title}${edition}. ${orgPart}.${doi}`;
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
      return `${authors} ${year}. ${ref.title}. ${editor}, *${ref.subtitle ?? ''}*${pages}. ${orgPart}.`;
    }

    if (ref.type === 'thesis') {
      const inst = ref.institution ?? ref.publisher ?? '';
      return `${authors} ${year}. ${title} [Dissertação de Mestrado, ${inst}].`;
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
    const orgPart = CitationFormatter.publisherOrInstitution(ref);

    if (ref.type === 'book') {
      const edition = ref.edition ? ` ${ref.edition}th ed.` : '';
      const city = ref.city ?? '';
      return `${authors}. ${year}. ${title}.${edition} ${city}: ${orgPart}.`;
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

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Editora ou instituição — instituição tem prioridade pra theses, publisher pra books. */
  private static publisherOrInstitution(ref: BookReference): string {
    if (ref.type === 'thesis') return ref.institution ?? ref.publisher ?? '';
    return ref.publisher ?? ref.institution ?? '';
  }

  /** Normaliza autor — aceita string (legado) ou objeto. Sempre retorna BookAuthor. */
  private static normalizeAuthor(a: unknown): BookAuthor {
    if (!a) return { surname: '', given_name: '' };
    if (typeof a === 'string') {
      const trimmed = a.trim();
      if (!trimmed) return { surname: '', given_name: '' };
      if (trimmed.includes(',')) {
        const [surname, ...rest] = trimmed.split(',');
        return { surname: surname.trim(), given_name: rest.join(',').trim() };
      }
      const parts = trimmed.split(/\s+/);
      if (parts.length === 1) return { surname: parts[0], given_name: '' };
      return { surname: parts[parts.length - 1], given_name: parts.slice(0, -1).join(' ') };
    }
    const obj = a as Partial<BookAuthor>;
    return { surname: obj.surname ?? '', given_name: obj.given_name ?? '' };
  }

  /** Formato ABNT: SOBRENOME, Nome */
  static abntAuthorString(a: BookAuthor | string): string {
    const n = CitationFormatter.normalizeAuthor(a);
    return `${(n.surname || '').toUpperCase()}, ${n.given_name}`.trim().replace(/,\s*$/, '');
  }

  /** Formato APA: Surname, F. M. */
  static apaAuthorString(a: BookAuthor | string): string {
    const n = CitationFormatter.normalizeAuthor(a);
    const initials = (n.given_name || '').split(/\s+/).filter(Boolean).map(p => p[0]?.toUpperCase() + '.').join(' ');
    return initials ? `${n.surname}, ${initials}` : n.surname;
  }

  /** Formato Chicago: First Last */
  static chicagoAuthorString(a: BookAuthor | string): string {
    const n = CitationFormatter.normalizeAuthor(a);
    return `${n.given_name} ${n.surname}`.trim();
  }

  // ─── Author lists per style ────────────────────────────────────────────────

  /** ABNT: SOBRENOME, Nome; SOBRENOME2, Nome2; et al. (4+) */
  private static abntAuthors(authors: Array<BookAuthor | string>): string {
    if (!authors || authors.length === 0) return '';
    if (authors.length > 3) return `${CitationFormatter.abntAuthorString(authors[0])} et al.`;
    return authors.map(CitationFormatter.abntAuthorString).join('; ');
  }

  /** APA: Surname, F.; Surname2, F2. */
  private static apaAuthors(authors: Array<BookAuthor | string>): string {
    if (!authors || authors.length === 0) return '';
    const formatted = authors.map(CitationFormatter.apaAuthorString);
    if (formatted.length === 1) return formatted[0];
    if (formatted.length > 7) {
      return formatted.slice(0, 6).join(', ') + ', . . . ' + formatted[formatted.length - 1];
    }
    const last = formatted[formatted.length - 1];
    return formatted.slice(0, -1).join(', ') + ', & ' + last;
  }

  /** Chicago: First Last, First2 Last2, and First3 Last3 */
  private static chicagoAuthors(authors: Array<BookAuthor | string>): string {
    if (!authors || authors.length === 0) return '';
    const formatted = authors.map(CitationFormatter.chicagoAuthorString);
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
    return formatted.slice(0, -1).join(', ') + ', and ' + formatted[formatted.length - 1];
  }

  /** Short in-text citation for ABNT: (SOBRENOME, year) */
  static inTextAbnt(ref: BookReference): string {
    const a = CitationFormatter.normalizeAuthor(ref.authors[0]);
    return `(${(a.surname || '').toUpperCase()}, ${ref.year ?? 's.d.'})`;
  }

  /** Short in-text citation for APA: (Surname, year) */
  static inTextApa(ref: BookReference): string {
    const a = CitationFormatter.normalizeAuthor(ref.authors[0]);
    return `(${a.surname}, ${ref.year ?? 'n.d.'})`;
  }
}
