'use client';

import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Undo, Redo, ImagePlus, Asterisk, BookMarked,
} from 'lucide-react';
import {
  $getSelection, $isRangeSelection, $insertNodes, $createParagraphNode,
  FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { MediaPickerModal } from '@/shared/components/MediaPickerModal';
import { $createImageNode } from '../ImageNode';

function ToolbarButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button type="button" title={title} onClick={onClick} className="btn btn-ghost btn-xs p-1 min-h-0 h-7">
      {children}
    </button>
  );
}

interface ToolbarProps {
  /** When provided, shows a footnote button. Returns the next [^N] number to insert. */
  onRequestFootnote?: () => number;
  /**
   * When provided, shows a citation button. Opens picker; receives a callback
   * to insert citation text at the cursor when user picks one.
   */
  onRequestCitation?: (insertAtCursor: (text: string) => void) => void;
}

export function Toolbar({ onRequestFootnote, onRequestCitation }: ToolbarProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [imageOpen, setImageOpen] = useState(false);

  function applyHeading(tag: 'h1' | 'h2' | 'h3') {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createHeadingNode(tag));
    });
  }

  function applyQuote() {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createQuoteNode());
    });
  }

  function insertTextAtCursor(text: string) {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        sel.insertText(text);
      }
    });
  }

  function insertFootnoteAtCursor() {
    if (!onRequestFootnote) return;
    const num = onRequestFootnote();
    insertTextAtCursor(`[^${num}]`);
  }

  function openCitationPicker() {
    if (!onRequestCitation) return;
    onRequestCitation(insertTextAtCursor);
  }

  function insertImageMarkdown(url: string, alt: string) {
    editor.update(() => {
      const imageNode = $createImageNode(url, alt);
      const trailing = $createParagraphNode();
      $insertNodes([imageNode, trailing]);
      trailing.selectStart();
    });
    setImageOpen(false);
  }

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-base-300 bg-base-200">
      <ToolbarButton title="Negrito" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><Bold className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Itálico" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><Italic className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Riscado" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}><Strikethrough className="w-3.5 h-3.5" /></ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Título 1" onClick={() => applyHeading('h1')}><Heading1 className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Título 2" onClick={() => applyHeading('h2')}><Heading2 className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Título 3" onClick={() => applyHeading('h3')}><Heading3 className="w-3.5 h-3.5" /></ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Lista" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Lista numerada" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Citação" onClick={applyQuote}><Quote className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Código" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}><Code className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Inserir imagem" onClick={() => setImageOpen(true)}><ImagePlus className="w-3.5 h-3.5" /></ToolbarButton>
      {onRequestFootnote && (
        <ToolbarButton title="Inserir nota de rodapé" onClick={insertFootnoteAtCursor}>
          <Asterisk className="w-3.5 h-3.5" />
        </ToolbarButton>
      )}
      {onRequestCitation && (
        <ToolbarButton title="Citar referência da bibliografia" onClick={openCitationPicker}>
          <BookMarked className="w-3.5 h-3.5" />
        </ToolbarButton>
      )}
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Desfazer" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Refazer" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo className="w-3.5 h-3.5" /></ToolbarButton>

      {imageOpen && (
        <MediaPickerModal
          mode="insert"
          accept="image"
          folder="library/inline"
          onConfirm={({ url, alt }) => insertImageMarkdown(url, alt)}
          onClose={() => setImageOpen(false)}
        />
      )}
    </div>
  );
}
