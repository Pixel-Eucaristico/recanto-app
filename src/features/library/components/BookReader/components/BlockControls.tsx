'use client';

import { Bookmark, Highlighter, MessageSquare, Tag, Link as LinkIcon, Check } from 'lucide-react';
import type { BookHighlight } from '@/domain/library/types';
import { Tooltip } from '@/shared/components/Tooltip';
import { highlightIcon } from '../utils/constants';

interface BlockControlsProps {
  'data-controls'?: string;
  refLabel: string;
  isBookmarked: boolean;
  onBookmark: () => void;
  onCopy: () => void;
  copied: boolean;
  firstHighlight: BookHighlight | undefined;
  highlightCount: number;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  tagCount: number;
  onOpenTag: () => void;
  commentCount: number;
  onOpenComment: () => void;
}

export function BlockControls({
  refLabel, isBookmarked, onBookmark, onCopy, copied,
  firstHighlight, highlightCount, pickerOpen, onTogglePicker,
  tagCount, onOpenTag, commentCount, onOpenComment, ...rest
}: BlockControlsProps) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-1 mt-1" {...rest}>
      <Tooltip tip={isBookmarked ? 'Remover marcador' : 'Marcar onde parei'} position="right">
        <button
          type="button"
          onClick={onBookmark}
          className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors border ${
            isBookmarked
              ? 'text-warning border-warning/40 bg-warning/10'
              : 'text-base-content/40 border-base-300 hover:text-warning hover:border-warning/40 hover:bg-warning/10'
          }`}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? 'Remover marcador' : 'Marcar onde parei'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-warning' : ''}`} />
        </button>
      </Tooltip>

      <Tooltip
        tip={highlightCount > 0 ? `${highlightCount} destaque(s) — selecione texto para adicionar` : 'Selecione texto para destacar'}
        position="right"
      >
        <button
          type="button"
          onClick={onTogglePicker}
          className={`relative flex items-center justify-center w-6 h-6 rounded-md transition-colors border ${
            highlightCount > 0
              ? firstHighlight
                ? `${highlightIcon[firstHighlight.color]} border-current/40 bg-current/10`
                : 'text-warning border-warning/40 bg-warning/10'
              : 'text-base-content/40 border-base-300 hover:text-primary hover:border-primary/40'
          }`}
          aria-label="Destacar texto selecionado"
        >
          <Highlighter className="w-3.5 h-3.5" />
          {highlightCount > 1 && (
            <span className="absolute -top-1 -right-1 bg-warning text-warning-content rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center font-bold leading-none">
              {highlightCount > 9 ? '9+' : highlightCount}
            </span>
          )}
        </button>
      </Tooltip>

      <Tooltip tip={commentCount > 0 ? `${commentCount} nota${commentCount > 1 ? 's' : ''}` : 'Adicionar nota'} position="right">
        <button
          type="button"
          onClick={onOpenComment}
          className="relative flex items-center justify-center w-6 h-6 rounded-md text-base-content/40 border border-base-300 hover:text-primary hover:border-primary/40 transition-colors"
          aria-label="Notas do parágrafo"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {commentCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-content rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center font-bold leading-none">
              {commentCount > 9 ? '9+' : commentCount}
            </span>
          )}
        </button>
      </Tooltip>

      <Tooltip tip={tagCount > 0 ? `${tagCount} marcador(es)` : 'Adicionar marcador'} position="right">
        <button
          type="button"
          onClick={onOpenTag}
          className={`relative flex items-center justify-center w-6 h-6 rounded-md transition-colors border ${
            tagCount > 0
              ? 'text-secondary border-secondary/40 bg-secondary/10'
              : 'text-base-content/40 border-base-300 hover:text-secondary hover:border-secondary/40'
          }`}
          aria-label="Marcadores do parágrafo"
        >
          <Tag className="w-3.5 h-3.5" />
          {tagCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-secondary-content rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center font-bold leading-none">
              {tagCount > 9 ? '9+' : tagCount}
            </span>
          )}
        </button>
      </Tooltip>

      <Tooltip tip={copied ? 'Copiado!' : `Link ${refLabel}`} position="right">
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center justify-center w-6 h-6 rounded-md text-base-content/40 border border-base-300 hover:text-primary hover:border-primary/40 transition-colors"
          aria-label={`Copiar link para ${refLabel}`}
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <LinkIcon className="w-3 h-3" />}
        </button>
      </Tooltip>
    </div>
  );
}
