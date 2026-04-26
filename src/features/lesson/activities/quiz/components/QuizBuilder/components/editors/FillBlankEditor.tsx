'use client';

import type { FillBlankQuestion, QuizQuestion } from '@/domain/quiz/types';
import { FillBlankEntity } from '@/domain/quiz/entities/questionTypes/FillBlank';
import { FillBlankField } from '@/shared/components/FillBlankField';

interface FillBlankEditorProps {
  question: FillBlankQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
}

export function FillBlankEditor({ question, onChange }: FillBlankEditorProps) {
  function setTemplate(template: string) {
    const blanks = FillBlankEntity.deriveBlanks(template, question.blanks);
    onChange({ template, blanks } as Partial<QuizQuestion>);
  }

  return (
    <label className="form-control">
      <span className="label-text text-xs mb-1">
        Texto com lacunas — selecione uma palavra e clique em{' '}
        <span className="badge badge-ghost badge-xs">Inserir lacuna</span> na barra. Para aceitar sinônimos
        separe por vírgula: <code className="bg-base-200 px-1 rounded">{'{{caridade,amor}}'}</code>.
      </span>
      <FillBlankField
        value={question.template}
        onChange={setTemplate}
        placeholder="Ex.: A virtude da {{caridade,amor}} nos leva a {{amar}} os irmãos."
        height={180}
      />
    </label>
  );
}
