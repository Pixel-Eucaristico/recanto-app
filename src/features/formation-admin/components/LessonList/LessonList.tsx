'use client';

import { BookOpen, Pencil, Trash2, Plus, Video, FileText, MessageSquare, Award, Quote, Library } from 'lucide-react';
import type { FormationLesson } from '@/domain/formation/types';

interface LessonListProps {
  lessons: FormationLesson[];
  onCreate: () => void;
  onEdit: (l: FormationLesson) => void;
  onDelete: (l: FormationLesson) => void;
}

export function LessonList({ lessons, onCreate, onEdit, onDelete }: LessonListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Aulas
        </h3>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={onCreate}>
          <Plus className="w-4 h-4" /> Nova aula
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-8 text-sm text-base-content/60">
          Nenhuma aula. Clique em &quot;Nova aula&quot;.
        </div>
      ) : (
        <ul className="space-y-2">
          {lessons.map(l => {
            const hasVideo = !!l.video_url;
            const hasApostila = !!l.apostila_content;
            const hasQuiz = l.requires_quiz && !!l.quiz_id;
            const hasReflection = l.requires_reflection;
            const hasForum = l.requires_forum_post;
            const hasCitations = (l.book_citations?.length ?? 0) > 0;
            const hasQuotes = (l.highlight_quotes?.length ?? 0) > 0;

            return (
              <li key={l.id} className="card bg-base-100 border border-base-300">
                <div className="card-body p-3 gap-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="badge badge-outline badge-xs">#{l.order}</span>
                      </div>
                      <h4 className="font-semibold text-sm">{l.title}</h4>
                      {l.description && (
                        <p className="text-xs text-base-content/60 line-clamp-2 mt-0.5">{l.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hasVideo && <span className="badge badge-info badge-xs gap-0.5"><Video className="w-2.5 h-2.5" />vídeo</span>}
                        {hasApostila && <span className="badge badge-secondary badge-xs gap-0.5"><FileText className="w-2.5 h-2.5" />apostila</span>}
                        {hasReflection && <span className="badge badge-accent badge-xs">caderno</span>}
                        {hasQuiz && <span className="badge badge-warning badge-xs gap-0.5"><Award className="w-2.5 h-2.5" />quiz</span>}
                        {hasForum && <span className="badge badge-success badge-xs gap-0.5"><MessageSquare className="w-2.5 h-2.5" />fórum</span>}
                        {hasCitations && <span className="badge badge-primary badge-xs gap-0.5"><Library className="w-2.5 h-2.5" />livro</span>}
                        {hasQuotes && <span className="badge badge-ghost badge-xs gap-0.5"><Quote className="w-2.5 h-2.5" />citações</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" className="btn btn-primary btn-xs gap-1" onClick={() => onEdit(l)}>
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => onDelete(l)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
