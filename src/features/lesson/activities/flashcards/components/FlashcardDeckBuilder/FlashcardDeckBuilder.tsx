'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@/domain/flashcards/types';
import { FlashcardEntity } from '@/domain/flashcards/entities/Flashcard';
import { flashcardService } from '@/application/flashcards/FlashcardService';
import { MarkdownField } from '@/shared/components/MarkdownField';
import ImageUpload from '@/components/cms-editor/ImageUpload';

interface FlashcardDeckBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: FlashcardDeck | null;
  onSaved?: (deck: FlashcardDeck) => void;
}

function gid(prefix = 'card') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function blankCard(): Flashcard {
  return { id: gid(), front: '', back: '' };
}

export function FlashcardDeckBuilder({ lessonId, createdBy, initial, onSaved }: FlashcardDeckBuilderProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [cards, setCards] = useState<Flashcard[]>(initial?.cards?.length ? initial.cards : [blankCard()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function updateCard(idx: number, patch: Partial<Flashcard>) {
    setCards(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function addCard() {
    setCards(prev => [...prev, blankCard()]);
  }

  function removeCard(idx: number) {
    if (cards.length <= 1) return;
    setCards(prev => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    setError(null);
    setSavedMsg(null);
    const payload: Omit<FlashcardDeck, 'id'> & { id?: string } = {
      id: initial?.id,
      lesson_id: lessonId,
      title: title.trim(),
      description: description.trim() || undefined,
      cards,
      created_at: initial?.created_at ?? new Date().toISOString(),
      created_by: initial?.created_by ?? createdBy,
    };
    const errors = FlashcardEntity.validateDeck(payload);
    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }
    setSaving(true);
    try {
      const saved = await flashcardService.save(payload as FlashcardDeck);
      setSavedMsg('Deck salvo com sucesso.');
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Terminologia vocacional"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
            <MarkdownField
              value={description}
              onChange={setDescription}
              placeholder="Contexto do deck..."
              height={140}
              preview="live"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {cards.map((card, cIdx) => (
          <div key={card.id} className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <div className="flex items-start gap-2">
                <GripVertical className="w-5 h-5 text-base-content/30 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary badge-sm">Card {cIdx + 1}</span>
                    <button
                      className="btn btn-ghost btn-xs text-error ml-auto"
                      onClick={() => removeCard(cIdx)}
                      disabled={cards.length <= 1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ImageUpload
                    label='Imagem da FRENTE (opcional — ativa modo "carta colecionável")'
                    folder="flashcards"
                    value={card.image_url ?? ''}
                    onChange={url => updateCard(cIdx, { image_url: url || undefined })}
                  />
                  <label className="form-control">
                    <span className="label-text text-xs mb-1">Frente (pergunta/conceito)</span>
                    <MarkdownField
                      value={card.front}
                      onChange={v => updateCard(cIdx, { front: v })}
                      placeholder="Frente do card"
                      height={120}
                      preview="edit"
                    />
                  </label>
                  <ImageUpload
                    label="Imagem do VERSO (opcional)"
                    folder="flashcards"
                    value={card.image_url_back ?? ''}
                    onChange={url => updateCard(cIdx, { image_url_back: url || undefined })}
                  />
                  <label className="form-control">
                    <span className="label-text text-xs mb-1">Verso (resposta/definição)</span>
                    <MarkdownField
                      value={card.back}
                      onChange={v => updateCard(cIdx, { back: v })}
                      placeholder="Verso do card"
                      height={120}
                      preview="edit"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-ghost btn-sm gap-1" onClick={addCard}>
          <Plus className="w-4 h-4" />
          Adicionar card
        </button>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      {savedMsg && <div className="alert alert-success text-sm"><span>{savedMsg}</span></div>}

      <div className="flex justify-end">
        <button className="btn btn-primary gap-1" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar deck'}
        </button>
      </div>
    </div>
  );
}
