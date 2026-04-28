'use client';

import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@/domain/flashcards/types';
import { FlashcardEntity } from '@/domain/flashcards/entities/Flashcard';
import { flashcardService } from '@/application/flashcards/FlashcardService';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { RichContent } from '@/shared/components/RichContent';
import { EditableCard, EditableGroup } from '@/shared/components/EditableCard';
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
    <EditableGroup>
      <div className="space-y-5">
      <EditableCard
        badge={
          <>
            <span className="badge badge-secondary badge-sm">Deck</span>
            {title.trim() && <span className="font-semibold text-sm truncate">{title}</span>}
            <span className="badge badge-outline badge-xs">{cards.length} cartões</span>
          </>
        }
        preview={
          <div className="space-y-1">
            {!title.trim() && (
              <p className="text-sm italic text-base-content/40">(sem título — clique no lápis)</p>
            )}
            {description.trim() ? (
              <RichContent markdown={description} className="text-sm" />
            ) : (
              <p className="text-xs italic text-base-content/40">(sem descrição)</p>
            )}
          </div>
        }
        editor={
          <div className="space-y-3">
            <div>
              <span className="label-text text-xs mb-1 block">Título</span>
              <input
                className="input input-bordered input-sm w-full"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex.: Terminologia vocacional"
              />
            </div>
            <div>
              <span className="label-text text-xs mb-1 block">Descrição (Markdown)</span>
              <MarkdownField
                value={description}
                onChange={setDescription}
                placeholder="Contexto do deck..."
                height={140}
                preview="edit"
              />
            </div>
          </div>
        }
      />

      <div className="space-y-3">
        {cards.map((card, cIdx) => (
          <EditableCard
            key={card.id}
            canRemove={cards.length > 1}
            onRemove={() => removeCard(cIdx)}
            dragHandle
            badge={<span className="badge badge-primary badge-sm">Card {cIdx + 1}</span>}
            preview={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="border border-base-300 rounded-lg p-2 bg-base-200/40">
                  <p className="text-[10px] uppercase font-semibold text-base-content/50 mb-1">Frente</p>
                  {card.front?.trim() ? (
                    <RichContent markdown={card.front} className="text-sm" />
                  ) : <span className="italic text-base-content/40">(vazia)</span>}
                </div>
                <div className="border border-base-300 rounded-lg p-2 bg-base-200/40">
                  <p className="text-[10px] uppercase font-semibold text-base-content/50 mb-1">Verso</p>
                  {card.back?.trim() ? (
                    <RichContent markdown={card.back} className="text-sm" />
                  ) : <span className="italic text-base-content/40">(vazio)</span>}
                </div>
              </div>
            }
            editor={
              <div className="space-y-3">
                <ImageUpload
                  label='Imagem da FRENTE (opcional — modo "carta colecionável")'
                  folder="flashcards"
                  value={card.image_url ?? ''}
                  onChange={url => updateCard(cIdx, { image_url: url || undefined })}
                />
                <div>
                  <span className="label-text text-xs mb-1 block">Frente (pergunta/conceito)</span>
                  <MarkdownField
                    value={card.front}
                    onChange={v => updateCard(cIdx, { front: v })}
                    placeholder="Frente do card"
                    height={120}
                    preview="edit"
                  />
                </div>
                <ImageUpload
                  label="Imagem do VERSO (opcional)"
                  folder="flashcards"
                  value={card.image_url_back ?? ''}
                  onChange={url => updateCard(cIdx, { image_url_back: url || undefined })}
                />
                <div>
                  <span className="label-text text-xs mb-1 block">Verso (resposta/definição)</span>
                  <MarkdownField
                    value={card.back}
                    onChange={v => updateCard(cIdx, { back: v })}
                    placeholder="Verso do card"
                    height={120}
                    preview="edit"
                  />
                </div>
              </div>
            }
          />
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
    </EditableGroup>
  );
}
