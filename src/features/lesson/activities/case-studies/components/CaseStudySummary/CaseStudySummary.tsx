'use client';

import { CheckCircle2, RefreshCw, Route } from 'lucide-react';
import { CaseStudy, CaseStep } from '@/domain/case-studies/types';
import { RichContent } from '@/shared/components/RichContent';

interface CaseStudySummaryProps {
  caseStudy: CaseStudy;
  path: CaseStep[];
  persisted: boolean;
  onRestart?: () => void;
}

export function CaseStudySummary({ caseStudy, path, persisted, onRestart }: CaseStudySummaryProps) {
  return (
    <div className="space-y-4">
      <div className="card bg-success/10 border border-success">
        <div className="card-body items-center text-center gap-2">
          <CheckCircle2 className="w-12 h-12 text-success" />
          <h2 className="text-2xl font-bold text-base-content">Caso concluído</h2>
          <p className="text-xs text-base-content/60">
            {persisted
              ? 'Primeira travessia — registrada para o formador e no caderno.'
              : 'Retake — mostrado, não registrado.'}
          </p>
          {onRestart && (
            <button className="btn btn-ghost btn-sm gap-1 mt-2" onClick={onRestart}>
              <RefreshCw className="w-4 h-4" />
              Refazer
            </button>
          )}
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-base-content">Caminho percorrido</h3>
          </div>
          <ol className="space-y-3">
            {path.map((step, idx) => {
              const node = caseStudy.nodes[step.node_id];
              const choice = step.choice_id && node?.choices
                ? node.choices.find(c => c.id === step.choice_id)
                : null;
              return (
                <li key={`${step.node_id}-${idx}`} className="border-l-2 border-primary/40 pl-3 space-y-1">
                  <div className="text-xs text-base-content/50">Passo {idx + 1}</div>
                  {node && (
                    <div className="text-sm text-base-content/80">
                      <RichContent markdown={node.text} />
                    </div>
                  )}
                  {choice && (
                    <div className="text-sm font-medium text-primary">
                      → {choice.label}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
