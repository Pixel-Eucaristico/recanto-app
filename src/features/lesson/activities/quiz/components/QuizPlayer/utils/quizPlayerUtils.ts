import type { QuizQuestion, QuestionAnswer } from '@/domain/quiz/types';

export function emptyAnswer(q: QuizQuestion): QuestionAnswer {
  const kind = q.kind ?? 'multiple_choice';
  if (kind === 'multiple_choice' || kind === 'true_false') return '';
  if (kind === 'fill_blank') return [];
  if (kind === 'matching') return {};
  if (kind === 'sequence') return [];
  if (kind === 'classify') return {};
  return '';
}

export function kindLabel(kind: string): string {
  switch (kind) {
    case 'multiple_choice': return 'Múltipla escolha';
    case 'true_false': return 'V/F';
    case 'fill_blank': return 'Lacunas';
    case 'matching': return 'Relacionar';
    case 'sequence': return 'Ordenar';
    case 'classify': return 'Classificar';
    default: return kind;
  }
}
