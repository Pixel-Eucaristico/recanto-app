'use client';

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { WordSearchPuzzle } from '@/domain/word-search/types';
import { WordSearchEntity } from '@/domain/word-search/entities/WordSearch';
import { wordSearchService } from '@/application/word-search/WordSearchService';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface WordSearchBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: WordSearchPuzzle | null;
  onSaved?: (p: WordSearchPuzzle) => void;
}

export function WordSearchBuilder({ lessonId, createdBy, initial, onSaved }: WordSearchBuilderProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [size, setSize] = useState<number>(initial?.size ?? 12);
  const [words, setWords] = useState<string[]>(initial?.words ?? ['', '']);
  const [clues, setClues] = useState<string[]>(initial?.clues ?? ['', '']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function addWord() {
    setWords(prev => [...prev, '']);
    setClues(prev => [...prev, '']);
  }
  function removeWord(i: number) {
    if (words.length <= 2) return;
    setWords(prev => prev.filter((_, idx) => idx !== i));
    setClues(prev => prev.filter((_, idx) => idx !== i));
  }
  function updateWord(i: number, value: string) {
    setWords(prev => prev.map((w, idx) => (idx === i ? value : w)));
  }
  function updateClue(i: number, value: string) {
    setClues(prev => prev.map((c, idx) => (idx === i ? value : c)));
  }

  const minSize = WordSearchEntity.minGridSize(words.filter(w => w.trim().length >= 2));

  async function save() {
    setError(null);
    setSavedMsg(null);
    setSaving(true);
    try {
      // Filtra pares words+clues mantendo correspondência por índice
      const pairs = words.map((w, i) => ({ w: w.trim(), c: (clues[i] ?? '').trim() }))
        .filter(p => p.w.length >= 2);
      if (pairs.length < 2) throw new Error('Ao menos 2 palavras válidas (mín. 2 letras cada).');
      const cleanWords = pairs.map(p => p.w);
      const cleanClues = pairs.map(p => p.c);
      const saved = await wordSearchService.save({
        id: initial?.id,
        lesson_id: lessonId,
        title: title.trim(),
        description: description.trim() || undefined,
        size,
        words: cleanWords,
        clues: cleanClues,
        grid: initial?.grid ?? [],
        placements: initial?.placements ?? [],
        created_at: initial?.created_at ?? new Date().toISOString(),
        created_by: initial?.created_by ?? createdBy,
      });
      setSavedMsg('Caça-palavras gerado e salvo.');
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
              placeholder="Ex.: Virtudes teologais"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
            <MarkdownField value={description} onChange={setDescription} height={120} preview="live" />
          </label>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs mb-1">Tamanho do grid (8–20)</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              min={Math.max(8, minSize)}
              max={20}
              value={size}
              onChange={e => setSize(Number(e.target.value))}
            />
            <span className="text-xs text-base-content/60 mt-1">
              Mínimo sugerido pelas suas palavras: {minSize}
            </span>
          </label>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-2">
          <h3 className="text-sm font-semibold">Palavras</h3>
          <p className="text-xs text-base-content/60">
            Acentos/espaços serão removidos. Mínimo 2 palavras, cada uma com pelo menos 2 letras.
          </p>
          <p className="text-xs text-base-content/60">
            Pergunta/dica é opcional. Se vazia, o aluno verá a própria palavra na lista.
          </p>
          {words.map((w, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
              <div className="space-y-2">
                <input
                  className="input input-bordered input-sm w-full"
                  value={clues[i] ?? ''}
                  onChange={e => updateClue(i, e.target.value)}
                  placeholder={`Pergunta / dica ${i + 1} (opcional)`}
                />
                <input
                  className="input input-bordered input-sm w-full uppercase"
                  value={w}
                  onChange={e => updateWord(i, e.target.value)}
                  placeholder={`Palavra ${i + 1}`}
                />
              </div>
              <button
                className="btn btn-ghost btn-xs text-error self-start mt-2"
                onClick={() => removeWord(i)}
                disabled={words.length <= 2}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button className="btn btn-ghost btn-xs gap-1 self-start" onClick={addWord}>
            <Plus className="w-3.5 h-3.5" /> Adicionar palavra
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
