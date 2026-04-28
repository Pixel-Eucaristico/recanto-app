'use client';

import { Trash2, ChevronUp, ChevronDown, Heading1, Type, Quote, List, Code2, Image as ImageIcon } from 'lucide-react';
import { BookBlock, BookBlockKind } from '@/domain/library/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { MediaUpload } from '@/shared/components/MediaUpload';

const KIND_LABELS: Record<BookBlockKind, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  heading: { label: 'Título', icon: Heading1 },
  paragraph: { label: 'Parágrafo', icon: Type },
  quote: { label: 'Citação', icon: Quote },
  list: { label: 'Lista', icon: List },
  code: { label: 'Código', icon: Code2 },
  image_ref: { label: 'Imagem', icon: ImageIcon },
};

interface BlockEditorProps {
  block: BookBlock;
  index: number;
  total: number;
  onChange: (patch: Partial<BookBlock>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function BlockEditor({ block, index, total, onChange, onDelete, onMoveUp, onMoveDown }: BlockEditorProps) {
  const Icon = KIND_LABELS[block.kind].icon;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isImage = block.kind === 'image_ref';

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-ghost badge-sm gap-1">
            <Icon className="w-3 h-3" />
            {KIND_LABELS[block.kind].label}
          </span>
          {block.ref && <span className="badge badge-primary badge-sm">{block.ref}</span>}
          <span className="text-xs text-base-content/40">#{index + 1}</span>
          <div className="flex-1" />
          <select
            className="select select-bordered select-xs"
            value={block.kind}
            onChange={e => onChange({ kind: e.target.value as BookBlockKind })}
          >
            {Object.entries(KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {block.kind === 'heading' && (
            <select
              className="select select-bordered select-xs"
              value={block.heading_level ?? 2}
              onChange={e => onChange({ heading_level: Number(e.target.value) })}
              title="Nível do título"
            >
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>H{n}</option>)}
            </select>
          )}
          <button type="button" className="btn btn-ghost btn-xs" disabled={isFirst} onClick={onMoveUp} aria-label="Subir">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="btn btn-ghost btn-xs" disabled={isLast} onClick={onMoveDown} aria-label="Descer">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="btn btn-ghost btn-xs text-error" onClick={onDelete} aria-label="Remover">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {isImage ? (
          <ImageBlockField block={block} onChange={onChange} />
        ) : (
          <RichTextEditor
            value={block.content}
            onChange={v => onChange({ content: v })}
            height={block.kind === 'heading' ? 80 : 160}
            placeholder={
              block.kind === 'heading' ? 'Título do bloco...' :
              block.kind === 'quote' ? 'Citação...' :
              block.kind === 'list' ? 'Use a barra de ferramentas pra criar lista...' :
              block.kind === 'code' ? 'Bloco de código...' :
              'Comece a escrever...'
            }
          />
        )}
      </div>
    </div>
  );
}

function ImageBlockField({ block, onChange }: { block: BookBlock; onChange: (patch: Partial<BookBlock>) => void }) {
  // content armazena URL da imagem e legenda em formato `url|caption`
  const [url, ...captionParts] = (block.content ?? '').split('|');
  const caption = captionParts.join('|');

  function setUrl(newUrl: string) {
    onChange({ content: caption ? `${newUrl}|${caption}` : newUrl });
  }
  function setCaption(newCap: string) {
    onChange({ content: newCap ? `${url}|${newCap}` : url });
  }

  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative max-w-xs rounded-lg overflow-hidden border border-base-300">
          <img src={url} alt={caption || 'Bloco imagem'} className="w-full h-auto" />
          <button
            type="button"
            className="btn btn-circle btn-xs btn-error absolute top-1 right-1"
            onClick={() => setUrl('')}
          >×</button>
        </div>
      ) : (
        <MediaUpload
          accept="image"
          folder="library/blocks"
          onUploaded={asset => setUrl(asset.url)}
        />
      )}
      <input
        type="text"
        className="input input-bordered input-sm w-full"
        placeholder="Legenda (opcional)"
        value={caption}
        onChange={e => setCaption(e.target.value)}
      />
    </div>
  );
}
