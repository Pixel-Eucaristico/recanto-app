import { FillBlankQuestion, FillBlankSlot } from '@/domain/quiz/types';

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/** Matches either new inline-answer tokens `{{word,syn1,syn2}}` or legacy `__+` placeholders. */
const TOKEN_REGEX = /(\{\{[^}]+\}\}|__+)/g;

export interface FillBlankToken {
  kind: 'text' | 'blank';
  /** Para 'text' é o texto. Para 'blank' é o array de sinônimos aceitos (vazio se legado `__`). */
  content: string;
  answers: string[];
}

function parseBlankAnswers(raw: string): string[] {
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export class FillBlankEntity {
  /**
   * Quebra o template em tokens alternados (texto / lacuna).
   * Aceita `{{resp}}`, `{{resp,sin1,sin2}}` e `__+` (legado).
   */
  static tokenize(template: string): FillBlankToken[] {
    const parts = template.split(TOKEN_REGEX);
    const tokens: FillBlankToken[] = [];
    for (const part of parts) {
      if (!part) continue;
      if (/^\{\{[^}]+\}\}$/.test(part)) {
        const raw = part.slice(2, -2);
        const answers = parseBlankAnswers(raw);
        tokens.push({ kind: 'blank', content: raw.trim(), answers });
      } else if (/^__+$/.test(part)) {
        tokens.push({ kind: 'blank', content: '', answers: [] });
      } else {
        tokens.push({ kind: 'text', content: part, answers: [] });
      }
    }
    return tokens;
  }

  /** Conta quantas lacunas existem no template. */
  static placeholderCount(template: string): number {
    return FillBlankEntity.tokenize(template).filter(t => t.kind === 'blank').length;
  }

  /**
   * Deriva os slots a partir do template.
   * - `{{resp}}` → { accepted: [resp] }
   * - `{{resp,sin1,sin2}}` → { accepted: [resp, sin1, sin2] }
   * - `__+` → { accepted: [''] } (admin deve preencher depois)
   * Preserva respostas extras já configuradas em `existing` (mesmo índice).
   */
  static deriveBlanks(template: string, existing?: FillBlankSlot[]): FillBlankSlot[] {
    const tokens = FillBlankEntity.tokenize(template);
    const slots: FillBlankSlot[] = [];
    let i = 0;
    for (const t of tokens) {
      if (t.kind !== 'blank') continue;
      const prev = (existing?.[i]?.accepted ?? []).filter(a => a.trim().length > 0);
      if (t.answers.length > 0) {
        const merged = Array.from(new Set([...t.answers, ...prev]));
        slots.push({ accepted: merged });
      } else {
        slots.push({ accepted: prev.length > 0 ? prev : [''] });
      }
      i++;
    }
    return slots;
  }

  static validate(q: FillBlankQuestion): string[] {
    const errors: string[] = [];
    if (!q.template || q.template.trim().length === 0) errors.push('Template vazio.');
    const slots = FillBlankEntity.placeholderCount(q.template);
    if (slots === 0) errors.push('Adicione ao menos uma lacuna (use o botão "Inserir lacuna" ou `__`).');
    if (!q.blanks || q.blanks.length !== slots) {
      errors.push(`Número de respostas (${q.blanks?.length ?? 0}) difere do número de lacunas (${slots}).`);
    }
    q.blanks?.forEach((slot, i) => {
      const accepted = (slot?.accepted ?? []).filter(a => a && a.trim().length > 0);
      if (accepted.length === 0) errors.push(`Lacuna ${i + 1}: sem resposta válida.`);
    });
    return errors;
  }

  /** Pontuação fracionária — proporção de lacunas corretas. */
  static score(q: FillBlankQuestion, answer: string[] | undefined): number {
    if (!answer || answer.length === 0) return 0;
    const total = q.blanks.length;
    if (total === 0) return 0;
    let correct = 0;
    for (let i = 0; i < total; i++) {
      const given = normalize(answer[i] ?? '');
      const accepted = (q.blanks[i]?.accepted ?? []).map(normalize).filter(a => a.length > 0);
      if (given && accepted.includes(given)) correct++;
    }
    return correct / total;
  }
}
