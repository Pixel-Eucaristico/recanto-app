import { FillBlankQuestion } from '@/domain/quiz/types';

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export class FillBlankEntity {
  static placeholderCount(template: string): number {
    const matches = template.match(/__+/g);
    return matches ? matches.length : 0;
  }

  static validate(q: FillBlankQuestion): string[] {
    const errors: string[] = [];
    if (!q.template || q.template.trim().length === 0) errors.push('Template vazio.');
    const slots = FillBlankEntity.placeholderCount(q.template);
    if (slots === 0) errors.push('Template deve ter ao menos uma lacuna `__`.');
    if (!q.blanks || q.blanks.length !== slots) {
      errors.push(`Número de respostas (${q.blanks?.length ?? 0}) difere do número de lacunas (${slots}).`);
    }
    q.blanks?.forEach((slot, i) => {
      const accepted = slot?.accepted ?? [];
      if (accepted.length === 0) errors.push(`Lacuna ${i + 1}: sem resposta válida.`);
      if (accepted.some(a => !a || a.trim().length === 0)) errors.push(`Lacuna ${i + 1}: resposta vazia.`);
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
      const accepted = (q.blanks[i]?.accepted ?? []).map(normalize);
      if (given && accepted.includes(given)) correct++;
    }
    return correct / total;
  }
}
