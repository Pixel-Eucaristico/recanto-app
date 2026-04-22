'use client';

import { ChevronRight, Flag } from 'lucide-react';
import { CaseStudy, CaseNode } from '@/domain/case-studies/types';
import { RichContent } from '@/shared/components/RichContent';

interface CaseStudyPlayerProps {
  caseStudy: CaseStudy;
  currentNode: CaseNode;
  isEnd: boolean;
  submitting: boolean;
  onChoose: (choiceId: string) => void;
  onFinish: () => void;
}

export function CaseStudyPlayer({ caseStudy, currentNode, isEnd, submitting, onChoose, onFinish }: CaseStudyPlayerProps) {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-base-content">{caseStudy.title}</h2>
        {caseStudy.description && (
          <div className="text-sm text-base-content/60 mt-1"><RichContent markdown={caseStudy.description} /></div>
        )}
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div><RichContent markdown={currentNode.text} /></div>

          {!isEnd && currentNode.choices && currentNode.choices.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-base-content/60">Escolha:</p>
              {currentNode.choices.map(ch => (
                <button
                  key={ch.id}
                  className="btn btn-outline btn-primary w-full justify-between"
                  onClick={() => onChoose(ch.id)}
                >
                  <span className="text-left flex-1">{ch.label}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {isEnd && (
            <div className="space-y-3">
              {currentNode.feedback && (
                <div className="alert alert-info items-start">
                  <Flag className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1"><RichContent markdown={currentNode.feedback} /></div>
                </div>
              )}
              <button
                className="btn btn-primary w-full"
                onClick={onFinish}
                disabled={submitting}
              >
                {submitting ? 'Finalizando...' : 'Finalizar caso'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
