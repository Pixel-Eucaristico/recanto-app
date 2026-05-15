'use client';

import type {
  QuizQuestion, QuestionKind,
  MultipleChoiceQuestion, FillBlankQuestion,
  MatchingQuestion, SequenceQuestion, ClassifyQuestion,
} from '@/domain/quiz/types';
import { MultipleChoiceEditor } from './editors/MultipleChoiceEditor';
import { FillBlankEditor } from './editors/FillBlankEditor';
import { MatchingEditor } from './editors/MatchingEditor';
import { SequenceEditor } from './editors/SequenceEditor';
import { ClassifyEditor } from './editors/ClassifyEditor';

interface KindEditorProps {
  question: QuizQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
}

export function KindEditor({ question, onChange }: KindEditorProps) {
  const kind: QuestionKind = question.kind ?? 'multiple_choice';
  if (kind === 'multiple_choice' || kind === 'true_false')
    return <MultipleChoiceEditor question={question as MultipleChoiceQuestion} onChange={onChange} locked={kind === 'true_false'} />;
  if (kind === 'fill_blank')
    return <FillBlankEditor question={question as FillBlankQuestion} onChange={onChange} />;
  if (kind === 'matching')
    return <MatchingEditor question={question as MatchingQuestion} onChange={onChange} />;
  if (kind === 'sequence')
    return <SequenceEditor question={question as SequenceQuestion} onChange={onChange} />;
  if (kind === 'classify')
    return <ClassifyEditor question={question as ClassifyQuestion} onChange={onChange} />;
  return null;
}
