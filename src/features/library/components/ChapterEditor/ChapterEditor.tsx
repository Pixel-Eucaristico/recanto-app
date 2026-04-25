'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, X, Pencil, Eye } from 'lucide-react';
import { BookChapter } from '@/domain/library/types';
import { BookEntity } from '@/domain/library/entities/Book';
import { BlockMarkdownEntity } from '@/domain/library/entities/BlockMarkdown';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { RichContent } from '@/shared/components/RichContent';

interface ChapterEditorProps {
  bookId: string;
  chapter: BookChapter | null;
  defaultOrder: number;
  saving: boolean;
  onSave: (chapter: { book_id: string; order: number; title: string; subtitle?: string; blocks: BookChapter['blocks'] }) => Promise<void>;
  onCancel: () => void;
}

export function ChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel }: ChapterEditorProps) {
  const initialTitle = chapter?.title ?? '';
  const initialSubtitle = chapter?.subtitle ?? '';
  const initialOrder = chapter?.order ?? defaultOrder;
  const initialMarkdown = chapter ? BlockMarkdownEntity.stringify(chapter.blocks) : '';

  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [order, setOrder] = useState(initialOrder);
  // Conteúdo do capítulo unificado em markdown — Lexical é a fonte da verdade ao editar
  const [markdown, setMarkdown] = useState(initialMarkdown);
  // Snapshot do último estado salvo — pra detectar dirty
  const [baseline, setBaseline] = useState({
    title: initialTitle,
    subtitle: initialSubtitle,
    order: initialOrder,
    markdown: initialMarkdown,
  });
  // Modo: 'view' (preview com numeração) ou 'edit' (editor Lexical único)
  const [mode, setMode] = useState<'view' | 'edit'>(chapter ? 'view' : 'edit');
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    const t = chapter?.title ?? '';
    const s = chapter?.subtitle ?? '';
    const o = chapter?.order ?? defaultOrder;
    const m = chapter ? BlockMarkdownEntity.stringify(chapter.blocks) : '';
    setTitle(t);
    setSubtitle(s);
    setOrder(o);
    setMarkdown(m);
    setBaseline({ title: t, subtitle: s, order: o, markdown: m });
    setMode(chapter ? 'view' : 'edit');
  }, [chapter, defaultOrder]);

  const isDirty =
    title !== baseline.title ||
    (subtitle ?? '') !== (baseline.subtitle ?? '') ||
    order !== baseline.order ||
    markdown !== baseline.markdown;

  // Preview com refs canônicas — parse markdown → number
  const previewBlocks = useMemo(() => {
    const blocks = BlockMarkdownEntity.parse(markdown);
    return BookEntity.numberChapter({
      id: '',
      book_id: bookId,
      order,
      title,
      blocks,
      created_at: '',
    }).blocks;
  }, [markdown, bookId, order, title]);

  async function handleSave() {
    setError(null);
    const blocks = BlockMarkdownEntity.parse(markdown);
    if (blocks.length === 0) {
      setError('Capítulo vazio. Adicione pelo menos um parágrafo.');
      return;
    }
    try {
      await onSave({
        book_id: bookId,
        order,
        title,
        subtitle: subtitle || undefined,
        blocks,
      });
      // Após salvo, snapshot vira baseline + fecha o editor (volta pra view)
      setBaseline({ title, subtitle, order, markdown });
      setMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleBack() {
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    onCancel();
  }

  async function handleSaveAndClose() {
    setConfirmDiscard(false);
    await handleSave();
    if (!error) onCancel();
  }

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-bold flex items-center gap-2">
              {chapter ? `Capítulo ${chapter.order}` : 'Novo capítulo'}
              {isDirty && <span className="badge badge-warning badge-sm">Não salvo</span>}
            </h3>
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={handleBack}>
              <X className="w-4 h-4" /> Voltar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
            <label className="form-control">
              <span className="label-text text-xs mb-1">Título do capítulo</span>
              <input
                className="input input-bordered input-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </label>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Capítulo nº</span>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={order}
                onChange={e => setOrder(Number(e.target.value) || 1)}
                min={1}
                disabled={!!chapter}
                title={chapter ? 'Ordem fixada após criação' : ''}
              />
            </label>
          </div>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Subtítulo (opcional)</span>
            <input
              className="input input-bordered input-sm"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {mode === 'view' ? (
        <div
          className="card bg-base-100 border border-base-300 cursor-pointer hover:border-primary transition-colors"
          onDoubleClick={() => setMode('edit')}
          title="Duplo clique pra editar"
        >
          <div className="card-body p-4 gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-base-content/60 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Modo leitura — duplo clique pra editar
              </span>
              <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => setMode('edit')}>
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
            </div>

            {previewBlocks.length === 0 ? (
              <p className="text-sm text-base-content/40">Capítulo vazio. Clique em &quot;Editar&quot; pra escrever.</p>
            ) : (
              <div className="space-y-2">
                {previewBlocks.map((b, i) => (
                  <BlockPreview key={b.id ?? i} block={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-primary">
          <div className="card-body p-4 gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-base-content/60">
                Linhas em branco separam parágrafos. Use a barra pra formatar (negrito, título, citação, lista).
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setMode('view')}>
                  <Eye className="w-3.5 h-3.5" /> Pré-visualizar
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-xs gap-1"
                  onClick={handleSave}
                  disabled={saving || title.trim().length === 0}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Salvando...' : 'Salvar e fechar'}
                </button>
              </div>
            </div>

            <RichTextEditor
              value={markdown}
              onChange={setMarkdown}
              height={420}
              placeholder="Comece a escrever o capítulo. # título, > citação, - lista..."
            />

            <p className="text-[10px] text-base-content/50">
              Numeração canônica auto: parágrafos e citações ganham <code>{order}:1</code>, <code>{order}:2</code> etc. Headings e listas não numeram.
            </p>
          </div>
        </div>
      )}

      {confirmDiscard && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <X className="w-5 h-5 text-warning" /> Descartar alterações?
            </h3>
            <p className="py-4 text-sm">
              Você tem alterações não salvas neste capítulo. Se voltar agora elas serão perdidas.
            </p>
            <div className="modal-action gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDiscard(false)}
              >
                Continuar editando
              </button>
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={() => {
                  setConfirmDiscard(false);
                  onCancel();
                }}
              >
                Descartar e sair
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm gap-1"
                onClick={handleSaveAndClose}
                disabled={saving || title.trim().length === 0}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Salvando...' : 'Salvar e sair'}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/40"
            onClick={() => setConfirmDiscard(false)}
          />
        </div>
      )}
    </div>
  );
}

function BlockPreview({ block }: { block: BookChapter['blocks'][number] }) {
  const ref = block.ref;

  if (block.kind === 'heading') {
    const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold',
      2: 'text-xl font-bold',
      3: 'text-lg font-semibold',
      4: 'text-base font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-xs font-semibold uppercase',
    };
    return <p className={`${sizes[level]} my-2 text-base-content`}>{block.content}</p>;
  }

  if (block.kind === 'paragraph') {
    return (
      <p className="text-sm text-base-content flex gap-2">
        {ref && <span className="badge badge-primary badge-xs flex-shrink-0 mt-1">{ref}</span>}
        <span>{block.content}</span>
      </p>
    );
  }

  if (block.kind === 'quote') {
    return (
      <blockquote className="border-l-4 border-primary pl-3 italic text-base-content/80 my-2 flex gap-2">
        {ref && <span className="badge badge-primary badge-xs flex-shrink-0 mt-1 not-italic">{ref}</span>}
        <span>{block.content}</span>
      </blockquote>
    );
  }

  if (block.kind === 'list') {
    return <RichContent markdown={block.content} className="text-sm" />;
  }

  if (block.kind === 'code') {
    return (
      <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto my-2">
        <code>{block.content}</code>
      </pre>
    );
  }

  if (block.kind === 'image_ref') {
    const [url, ...captionParts] = (block.content ?? '').split('|');
    const caption = captionParts.join('|');
    return (
      <figure className="my-3 flex flex-col items-center w-full">
        {url && (
          <img
            src={url}
            alt={caption || 'imagem'}
            className="block rounded-lg max-w-full max-h-96 object-contain"
          />
        )}
        {caption && (
          <figcaption className="block w-full text-xs text-base-content/60 mt-2 text-center italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}
