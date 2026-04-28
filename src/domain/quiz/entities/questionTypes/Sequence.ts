import { SequenceQuestion } from '@/domain/quiz/types';

export class SequenceEntity {
  static validate(q: SequenceQuestion): string[] {
    const errors: string[] = [];
    if (!q.items || q.items.length < 2) errors.push('Sequência requer ao menos 2 itens.');
    q.items?.forEach((it, i) => {
      if (!it.text?.trim()) errors.push(`Item ${i + 1}: texto vazio.`);
    });
    const ids = (q.items ?? []).map(i => i.id);
    if (new Set(ids).size !== ids.length) errors.push('Itens com IDs duplicados.');
    return errors;
  }

  /** Pontuação fracionária — proporção de posições corretas. */
  static score(q: SequenceQuestion, answer: string[] | undefined): number {
    if (!answer) return 0;
    const total = q.items.length;
    if (total === 0) return 0;
    let correct = 0;
    for (let i = 0; i < total; i++) {
      if (answer[i] === q.items[i].id) correct++;
    }
    return correct / total;
  }
}
