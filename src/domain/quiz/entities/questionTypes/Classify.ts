import { ClassifyQuestion } from '@/domain/quiz/types';

export class ClassifyEntity {
  static validate(q: ClassifyQuestion): string[] {
    const errors: string[] = [];
    if (!q.buckets || q.buckets.length < 2) errors.push('Requer ao menos 2 categorias.');
    if (!q.cards || q.cards.length < 2) errors.push('Requer ao menos 2 cards.');
    q.buckets?.forEach((b, i) => {
      if (!b.label?.trim()) errors.push(`Categoria ${i + 1}: label vazio.`);
    });
    q.cards?.forEach((c, i) => {
      if (!c.text?.trim()) errors.push(`Card ${i + 1}: texto vazio.`);
      if (!q.buckets.some(b => b.id === c.bucket_id)) errors.push(`Card ${i + 1}: categoria inválida.`);
    });
    return errors;
  }

  /** Pontuação fracionária — proporção de cards corretamente classificados. */
  static score(q: ClassifyQuestion, answer: Record<string, string> | undefined): number {
    if (!answer) return 0;
    const total = q.cards.length;
    if (total === 0) return 0;
    let correct = 0;
    for (const card of q.cards) {
      if (answer[card.id] === card.bucket_id) correct++;
    }
    return correct / total;
  }
}
