'use client';

import type {
  QuizQuestion, QuestionAnswer,
  MultipleChoiceQuestion, FillBlankQuestion,
  MatchingQuestion, SequenceQuestion, ClassifyQuestion,
} from '@/domain/quiz/types';
import { FillBlankPlayer } from '../../FillBlankQuestion';
import { MatchingPlayer } from '../../MatchingQuestion';
import { SequencePlayer } from '../../SequenceQuestion';
import { ClassifyPlayer } from '../../ClassifyQuestion';
import { MultipleChoicePlayer } from './MultipleChoicePlayer';

interface QuizQuestionPlayerProps {
  question: QuizQuestion;
  answer: QuestionAnswer;
  revealed: boolean;
  onChange: (v: QuestionAnswer) => void;
}

export function QuizQuestionPlayer({ question, answer, revealed, onChange }: QuizQuestionPlayerProps) {
  const kind = question.kind ?? 'multiple_choice';

  if (kind === 'multiple_choice' || kind === 'true_false') {
    return (
      <MultipleChoicePlayer
        question={question as MultipleChoiceQuestion}
        selected={typeof answer === 'string' ? answer : ''}
        revealed={revealed}
        onChange={onChange}
      />
    );
  }

  if (kind === 'fill_blank') {
    const fb = question as FillBlankQuestion;
    return (
      <FillBlankPlayer
        question={fb}
        value={Array.isArray(answer) ? (answer as string[]) : []}
        onChange={onChange}
        disabled={revealed}
        feedback={revealed ? { correctBlanks: fb.blanks, isCorrect: false } : undefined}
      />
    );
  }

  if (kind === 'matching') {
    return (
      <MatchingPlayer
        question={question as MatchingQuestion}
        value={typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {}}
        onChange={onChange}
        disabled={revealed}
        feedback={revealed}
      />
    );
  }

  if (kind === 'sequence') {
    return (
      <SequencePlayer
        question={question as SequenceQuestion}
        value={Array.isArray(answer) ? (answer as string[]) : []}
        onChange={onChange}
        disabled={revealed}
        feedback={revealed}
      />
    );
  }

  if (kind === 'classify') {
    return (
      <ClassifyPlayer
        question={question as ClassifyQuestion}
        value={typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {}}
        onChange={onChange}
        disabled={revealed}
        feedback={revealed}
      />
    );
  }

  return null;
}
