'use client';

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface PracticalActivityProps {
  prompt: string;
  submitted?: boolean;
  initialContent?: string;
  minChars?: number;
  onSubmit: (content: string) => Promise<unknown>;
}

export function PracticalActivity({
  prompt,
  submitted = false,
  initialContent = '',
  minChars = 50,
  onSubmit,
}: PracticalActivityProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chars = content.trim().length;
  const canSend = chars >= minChars && !saving && !submitted;

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(content.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-base-content">Atividade prática</h3>
            <p className="text-sm text-base-content/70 mt-1 whitespace-pre-wrap">{prompt}</p>
          </div>
        </div>

        <textarea
          className="textarea textarea-bordered min-h-32"
          placeholder="Descreva sua prática, compromisso ou aplicação..."
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={submitted || saving}
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${chars < minChars ? 'text-warning' : 'text-base-content/60'}`}>
            {chars} / {minChars} caracteres mínimos
          </span>
          {submitted ? (
            <span className="badge badge-success">Enviada</span>
          ) : (
            <button className="btn btn-primary btn-sm gap-1" onClick={handleSubmit} disabled={!canSend}>
              <Send className="w-4 h-4" />
              Enviar atividade
            </button>
          )}
        </div>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      </div>
    </div>
  );
}
