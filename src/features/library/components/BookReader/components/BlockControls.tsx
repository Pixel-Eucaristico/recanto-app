'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Highlighter, MessageSquare, Tag, Link as LinkIcon, Check, ChevronDown } from 'lucide-react';
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
  /** Container que define quantos botões cabem (paragrafo/quote body). */
  containerRef?: RefObject<HTMLElement | null>;
}

const BUTTON_HEIGHT_PX = 24;
const GAP_PX = 4;
const ROW_PX = BUTTON_HEIGHT_PX + GAP_PX; // 28
const TOTAL_BUTTONS = 5;

export function BlockControls({
  refLabel, isBookmarked, onBookmark, onCopy, copied,
  firstHighlight, highlightCount, pickerOpen: _pickerOpen, onTogglePicker,
  tagCount, onOpenTag, commentCount, onOpenComment, containerRef, ...rest
}: BlockControlsProps) {
  // Default 0 — adaptado depois pelo ResizeObserver. Linha curta = só chevron.
  const [visibleCount, setVisibleCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chevronRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const recompute = () => {
      const available = el.getBoundingClientRect().height;
      if (available <= 0) return;
      const slots = Math.max(1, Math.floor(available / ROW_PX));
      if (slots >= TOTAL_BUTTONS) {
        // Espaço pra todos — sem chevron
        setVisibleCount(TOTAL_BUTTONS);
      } else {
        // Reserva 1 slot pro chevron. 1 linha → 0 botões visíveis (só chevron).
        setVisibleCount(Math.max(0, slots - 1));
      }
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  // Click-outside fecha popup (pointerdown cobre mouse + touch)
  useEffect(() => {
    if (!expanded) return;
    function onDocPointer(e: PointerEvent) {
      const root = rootRef.current;
      const target = e.target as Node;
      // Ignora click dentro do rootRef OU dentro do popup portaled
      if (root && root.contains(target)) return;
      const popup = document.getElementById('block-controls-popup');
      if (popup && popup.contains(target)) return;
      setExpanded(false);
    }
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, [expanded]);

  // Posiciona popup abaixo do chevron usando viewport coords (portal pra body)
  useEffect(() => {
    if (!expanded) { setPopupPos(null); return; }
    const btn = chevronRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    // position: fixed usa viewport coords — sem scrollY/scrollX
    setPopupPos({
      top: rect.bottom + 4,
      left: rect.left + rect.width / 2,
    });
  }, [expanded]);

  const buttons = [
    {
      key: 'bookmark',
      render: () => (
        <Tooltip key="bookmark" tip={isBookmarked ? 'Remover marcador' : 'Marcar onde parei'} position="right">
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
      ),
    },
    {
      key: 'highlight',
      render: () => (
        <Tooltip
          key="highlight"
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
      ),
    },
    {
      key: 'comment',
      render: () => (
        <Tooltip key="comment" tip={commentCount > 0 ? `${commentCount} nota${commentCount > 1 ? 's' : ''}` : 'Adicionar nota'} position="right">
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
      ),
    },
    {
      key: 'tag',
      render: () => (
        <Tooltip key="tag" tip={tagCount > 0 ? `${tagCount} marcador(es)` : 'Adicionar marcador'} position="right">
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
      ),
    },
    {
      key: 'copy',
      render: () => (
        <Tooltip key="copy" tip={copied ? 'Copiado!' : `Link ${refLabel}`} position="right">
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center justify-center w-6 h-6 rounded-md text-base-content/40 border border-base-300 hover:text-primary hover:border-primary/40 transition-colors"
            aria-label={`Copiar link para ${refLabel}`}
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <LinkIcon className="w-3 h-3" />}
          </button>
        </Tooltip>
      ),
    },
  ];

  const visible = buttons.slice(0, visibleCount);
  const hidden = buttons.slice(visibleCount);
  const hasHidden = hidden.length > 0;

  return (
    <div
      ref={rootRef}
      className={`group/blockctl shrink-0 w-6 flex flex-col items-center gap-1 relative ${expanded ? 'z-40' : 'z-10 hover:z-20'}`}
      {...rest}
    >
      {visible.map(b => b.render())}

      {hasHidden && (
        <button
          ref={chevronRef}
          type="button"
          onClick={() => setExpanded(e => !e)}
          className={`${expanded ? 'opacity-100' : 'opacity-60 group-hover/blockctl:opacity-100 pointer-coarse:opacity-100'} transition-opacity flex items-center justify-center w-6 h-6 rounded-md bg-base-100 text-base-content/60 border border-base-300 shadow-sm hover:text-primary hover:border-primary/40 hover:bg-base-200 active:bg-base-300 touch-manipulation`}
          aria-label={`Mostrar mais ${hidden.length} ação(ões)`}
          aria-expanded={expanded}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}

      {expanded && hasHidden && popupPos && typeof document !== 'undefined' && createPortal(
        <div
          id="block-controls-popup"
          className="fixed bg-base-100 border border-base-300 rounded-md shadow-lg p-1 flex flex-col gap-1"
          role="menu"
          style={{
            top: popupPos.top,
            left: popupPos.left,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
        >
          {hidden.map(b => b.render())}
        </div>,
        document.body,
      )}
    </div>
  );
}
