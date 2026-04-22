'use client';

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { CrosswordPuzzle, CrosswordClue } from '@/domain/crossword/types';
import { crosswordService } from '@/application/crossword/CrosswordService';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface CrosswordBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: CrosswordPuzzle | null;
  onSaved?: (p: CrosswordPuzzle) => void;
}

interface DraftClue extends CrosswordClue { _id: string; }

function gid() {
  return `c_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function CrosswordBuilder({ lessonId, createdBy, initial, onSaved }: CrosswordBuilderProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [clues, setClues] = useState<DraftClue[]>(
    initial?.entries?.length
      ? initial.entries.map(e => ({ _id: gid(), clue: e.clue, answer: e.answer }))
      : [{ _id: gid(), clue: '', answer: '' }, { _id: gid(), clue: '', answer: '' }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function updateClue(id: string, patch: Partial<CrosswordClue>) {
    setClues(prev => prev.map(c => (c._id === id ? { ...c, ...patch } : c)));
  }
  function addClue() {
    setClues(prev => [...prev, { _id: gid(), clue: '', answer: '' }]);
  }
  function removeClue(id: string) {
    if (clues.length <= 2) return;
    setClues(prev => prev.filter(c => c._id !== id));
  }

  async function save() {
    setError(null);
    setSavedMsg(null);
    setSaving(true);
    try {
      const cleaned = clues
        .map(c => ({ clue: c.clue.trim(), answer: c.answer.trim() }))
        .filter(c => c.clue.length > 0 && c.answer.length >= 2);
      if (cleaned.length < 2) throw new Error('Ao menos 2 pares válidos (pergunta + resposta com mín. 2 letras).');
      const saved = await crosswordService.save({
        id: initial?.id,
        lesson_id: lessonId,
        title,
        description: description || undefined,
        clues: cleaned,
        created_at: initial?.created_at,
        created_by: initial?.created_by ?? createdBy,
      });
      setSavedMsg('Palavras cruzadas geradas e salvas.');
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Virtudes cardeais"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
            <MarkdownField value={description} onChange={setDescription} height={120} preview="live" />
          </label>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <h3 className="text-sm font-semibold">Perguntas + respostas</h3>
          <p className="text-xs text-base-content/60">
            Uma linha por pergunta. A resposta será usada como palavra no grid. Acentos/espaços removidos.
          </p>
          {clues.map(c => (
            <div key={c._id} className="grid grid-cols-[1fr_auto] gap-2">
              <div className="space-y-2">
                <input
                  className="input input-bordered input-sm w-full"
                  value={c.clue}
                  onChange={e => updateClue(c._id, { clue: e.target.value })}
                  placeholder="Pergunta / dica (ex: Virtude que dá força contra o mal)"
                />
                <input
                  className="input input-bordered input-sm w-full uppercase"
                  value={c.answer}
                  onChange={e => updateClue(c._id, { answer: e.target.value })}
                  placeholder="Resposta (palavra)"
                />
              </div>
              <button
                className="btn btn-ghost btn-xs text-error self-start mt-2"
                onClick={() => removeClue(c._id)}
                disabled={clues.length <= 2}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button className="btn btn-ghost btn-xs gap-1 self-start" onClick={addClue}>
            <Plus className="w-3.5 h-3.5" /> Adicionar pergunta
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      {savedMsg && <div className="alert alert-success text-sm"><span>{savedMsg}</span></div>}

      <div className="flex justify-end">
        <button className="btn btn-primary gap-1" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Gerando grid...' : 'Gerar + salvar'}
        </button>
      </div>
    </div>
  );
}
