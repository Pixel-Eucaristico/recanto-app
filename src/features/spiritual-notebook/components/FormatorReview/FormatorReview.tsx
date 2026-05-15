'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { reflectionService } from '@/application/spiritual-notebook/ReflectionService';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface FormatorReviewProps {
  reflection: Reflection;
  onReviewed?: (updated: Reflection) => void;
}

export function FormatorReview({ reflection, onReviewed }: FormatorReviewProps) {
  const user = useCurrentUser();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user || notes.trim().length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await reflectionService.review({
        reflectionId: reflection.id,
        reviewerId: user.id,
        notes: notes.trim(),
      });
      onReviewed?.(updated);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3">
        <div>
          <div className="text-xs text-base-content/50">
            {reflection.track_title} · {reflection.module_title}
          </div>
          <h3 className="text-base font-semibold text-base-content">{reflection.lesson_title}</h3>
        </div>

        <div className="bg-base-200 rounded-lg p-3">
          <p className="text-sm whitespace-pre-wrap text-base-content">{reflection.content}</p>
        </div>

        {reflection.status === 'reviewed' ? (
          <div className="alert alert-success">
            <span>Reflexão já revisada.</span>
          </div>
        ) : (
          <>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Escreva um comentário pastoral para o aluno..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={saving}
            />
            {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
            <div className="flex justify-end">
              <button
                className="btn btn-primary btn-sm gap-1"
                onClick={handleSubmit}
                disabled={saving || notes.trim().length === 0}
              >
                <Send className="w-4 h-4" />
                Enviar comentário
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
