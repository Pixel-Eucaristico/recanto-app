import type { QuizOption, QuizQuestion, QuestionKind } from '@/domain/quiz/types';

export function gid(prefix = 'q') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function blankOption(): QuizOption {
  return { id: gid('o'), text: '', is_correct: false };
}

export const KIND_LABELS: Record<QuestionKind, string> = {
  multiple_choice: 'Múltipla escolha',
  true_false: 'Verdadeiro/Falso',
  fill_blank: 'Preencher lacunas',
  matching: 'Relacionar colunas',
  sequence: 'Ordenar sequência',
  classify: 'Classificar',
};

export function newQuestion(kind: QuestionKind): QuizQuestion {
  switch (kind) {
    case 'true_false':
      return {
        id: gid(), text: '', kind: 'true_false', explanation: '',
        options: [
          { id: gid('o'), text: 'Verdadeiro', is_correct: true },
          { id: gid('o'), text: 'Falso', is_correct: false },
        ],
      };
    case 'fill_blank':
      return { id: gid(), text: '', kind: 'fill_blank', template: '', blanks: [], explanation: '' };
    case 'matching':
      return {
        id: gid(), text: '', kind: 'matching', explanation: '',
        pairs: [{ id: gid('p'), left: '', right: '' }, { id: gid('p'), left: '', right: '' }],
      };
    case 'sequence':
      return {
        id: gid(), text: '', kind: 'sequence', explanation: '',
        items: [{ id: gid('i'), text: '' }, { id: gid('i'), text: '' }],
      };
    case 'classify':
      return {
        id: gid(), text: '', kind: 'classify', cards: [], explanation: '',
        buckets: [{ id: gid('b'), label: 'Categoria A' }, { id: gid('b'), label: 'Categoria B' }],
      };
    default:
      return { id: gid(), text: '', kind: 'multiple_choice', explanation: '', options: [blankOption(), blankOption()] };
  }
}
