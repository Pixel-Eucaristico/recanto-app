'use client';

import { Eye, CheckCircle2, Circle } from 'lucide-react';
import type { FormationLesson } from '@/domain/formation/types';
import { effectiveComponents } from '@/domain/lesson-components/migrationShim';
import { getLessonComponent } from '@/application/lesson/LessonComponentRegistry';

interface Props {
  lesson: FormationLesson;
}

/**
 * Preview de como o aluno verá o checklist da aula.
 * Mostra todas as etapas (obrigatórias + opcionais) com summary do plugin,
 * sem precisar entrar como aluno. Estado "done" é fictício (sempre Circle).
 */
export function LessonStepsPreview({ lesson }: Props) {
  const components = effectiveComponents(lesson);

  if (components.length === 0) {
    return (
      <div className="alert text-sm">
        <span>Sem etapas configuradas. Adicione componentes ou flags pra ver o preview.</span>
      </div>
    );
  }

  const required = components.filter(c => c.required).length;
  const optional = components.length - required;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 sm:p-4 gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-semibold flex items-center gap-1">
            <Eye className="w-4 h-4 text-info" /> Preview do checklist (visão do aluno)
          </h3>
          <div className="flex gap-1">
            <span className="badge badge-warning badge-xs">{required} obrigatória(s)</span>
            {optional > 0 && <span className="badge badge-ghost badge-xs">{optional} opcional(is)</span>}
          </div>
        </div>

        <ul className="space-y-1.5">
          {components.map(inst => {
            const plugin = getLessonComponent(inst.kind);
            if (!plugin) {
              return (
                <li key={inst.id} className="text-xs text-error">
                  Plugin &quot;{inst.kind}&quot; não registrado
                </li>
              );
            }
            const Icon = plugin.icon;
            const summary = plugin.summary(inst.config);
            return (
              <li key={inst.id} className="flex items-start gap-2">
                <Circle className="w-4 h-4 text-base-content/30 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                    <span className="text-sm">{summary.label}</span>
                    {!inst.required && <span className="badge badge-ghost badge-xs">opcional</span>}
                  </div>
                  {summary.description && (
                    <p className="text-xs text-base-content/60">{summary.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-[11px] text-base-content/50 italic">
          Aluno destrava próxima aula só com as obrigatórias concluídas. Opcionais aparecem mas não bloqueiam.
        </p>
      </div>
    </div>
  );
}
