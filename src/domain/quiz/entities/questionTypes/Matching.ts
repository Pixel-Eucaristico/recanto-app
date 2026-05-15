import { MatchingQuestion } from '@/domain/quiz/types';

export class MatchingEntity {
  static validate(q: MatchingQuestion): string[] {
    const errors: string[] = [];
    if (!q.pairs || q.pairs.length < 2) errors.push('Matching requer ao menos 2 pares.');
    q.pairs?.forEach((p, i) => {
      if (!p.left?.trim()) errors.push(`Par ${i + 1}: coluna esquerda vazia.`);
      if (!p.right?.trim()) errors.push(`Par ${i + 1}: coluna direita vazia.`);
    });
    const ids = (q.pairs ?? []).map(p => p.id);
    if (new Set(ids).size !== ids.length) errors.push('Pares com IDs duplicados.');
    return errors;
  }

  /** Pontuação fracionária — proporção de pares corretos. Esperado answer: { leftPairId: rightPairId }. */
  static score(q: MatchingQuestion, answer: Record<string, string> | undefined): number {
    if (!answer) return 0;
    const total = q.pairs.length;
    if (total === 0) return 0;
    let correct = 0;
    for (const pair of q.pairs) {
      if (answer[pair.id] === pair.id) correct++;
    }
    return correct / total;
  }
}
