'use client';

import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, Quote, Code, Undo, Redo, ImagePlus, Asterisk, BookMarked,
  AlignLeft, AlignCenter, AlignRight, Table,
  Rows3, Columns3, Trash2, Heading,
  ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine,
} from 'lucide-react';
import {
  $getSelection, $isRangeSelection, $insertNodes, $createParagraphNode, $getRoot,
  FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND,
  type LexicalNode,
  type ElementFormatType,
  $isElementNode,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode, $isQuoteNode, $createQuoteNode } from '@lexical/rich-text';
import { $isListNode } from '@lexical/list';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
  INSERT_TABLE_COMMAND,
  $isTableCellNode, $isTableNode, $getTableNodeFromLexicalNodeOrThrow,
  $insertTableRow__EXPERIMENTAL, $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL, $deleteTableColumn__EXPERIMENTAL,
  TableCellHeaderStates,
} from '@lexical/table';
import { $findMatchingParent } from '@lexical/utils';
import { MediaPickerModal } from '@/shared/components/MediaPickerModal';
import { $createImageNode } from '../ImageNode';
import { $createFootnoteRefNode, $isFootnoteRefNode, FootnoteRefNode } from '../FootnoteRefNode';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Coleta todas FootnoteRefNode em ordem de documento via DFS. */
function collectFootnoteRefs(root: LexicalNode, out: FootnoteRefNode[]): void {
  if ($isFootnoteRefNode(root)) {
    out.push(root);
    return;
  }
  const elem = root as { getChildren?: () => LexicalNode[] };
  if (typeof elem.getChildren === 'function') {
    for (const child of elem.getChildren()) collectFootnoteRefs(child, out);
  }
}

interface ToolbarButtonProps {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
}

function ToolbarButton({ children, title, onClick, active = false }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active}
      className={`btn btn-xs p-1 min-h-0 h-7 ${
        active
          ? 'btn-primary text-primary-content'
          : 'btn-ghost text-base-content/70 hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

interface ToolbarProps {
  onRequestFootnote?: (insertAtCursor: (text: string) => void) => number | void;
  onRequestCitation?: (insertAtCursor: (text: string) => void) => void;
}

export function Toolbar({ onRequestFootnote, onRequestCitation }: ToolbarProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [imageOpen, setImageOpen] = useState(false);

  // Estado ativo refletido na toolbar
  const [active, setActive] = useState({
    bold: false,
    italic: false,
    strikethrough: false,
    code: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
    quote: false,
    ul: false,
    ol: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
  });

  // Maior nível de heading usado no documento (controla exibição progressiva H4-H6)
  const [maxHeadingLevel, setMaxHeadingLevel] = useState(0);
  // Cursor dentro de célula de tabela → mostra toolbar contextual
  const [inTable, setInTable] = useState(false);
  const [cellIsHeader, setCellIsHeader] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        const next = {
          bold: false, italic: false, strikethrough: false, code: false,
          h1: false, h2: false, h3: false, h4: false, h5: false, h6: false,
          quote: false, ul: false, ol: false,
          alignLeft: false, alignCenter: false, alignRight: false,
        };

        // Scan documento pra detectar máximo heading level usado
        let max = 0;
        const root = $getRoot();
        const walk = (node: LexicalNode) => {
          if ($isHeadingNode(node)) {
            const tag = node.getTag();
            const n = Number(tag.replace('h', ''));
            if (n > max) max = n;
          }
          if ($isElementNode(node)) {
            for (const child of node.getChildren()) walk(child);
          }
        };
        walk(root);
        setMaxHeadingLevel(max);

        if ($isRangeSelection(sel)) {
          next.bold = sel.hasFormat('bold');
          next.italic = sel.hasFormat('italic');
          next.strikethrough = sel.hasFormat('strikethrough');
          next.code = sel.hasFormat('code');

          const anchorNode = sel.anchor.getNode();

          // Detecta se cursor está dentro de uma célula de tabela
          const cellNode = $findMatchingParent(anchorNode, $isTableCellNode);
          if (cellNode && $isTableCellNode(cellNode)) {
            setInTable(true);
            setCellIsHeader((cellNode.getHeaderStyles() & TableCellHeaderStates.ROW) !== 0);
          } else {
            setInTable(false);
            setCellIsHeader(false);
          }

          const elementNode = anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();

          if ($isHeadingNode(elementNode)) {
            const tag = elementNode.getTag();
            if (tag === 'h1') next.h1 = true;
            if (tag === 'h2') next.h2 = true;
            if (tag === 'h3') next.h3 = true;
            if (tag === 'h4') next.h4 = true;
            if (tag === 'h5') next.h5 = true;
            if (tag === 'h6') next.h6 = true;
          } else if ($isQuoteNode(elementNode)) {
            next.quote = true;
          } else if ($isListNode(elementNode)) {
            const listType = elementNode.getListType();
            if (listType === 'bullet') next.ul = true;
            if (listType === 'number') next.ol = true;
          }

          if ($isElementNode(elementNode)) {
            const format = elementNode.getFormatType();
            if (format === 'left') next.alignLeft = true;
            if (format === 'center') next.alignCenter = true;
            if (format === 'right') next.alignRight = true;
          }
        }

        setActive(next);
      });
    });
  }, [editor]);

  function applyHeading(tag: HeadingTag) {
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

  function applyAlign(format: ElementFormatType) {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }

  function withTableSelection(fn: () => void) {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      fn();
    });
  }

  function insertRowAbove() {
    withTableSelection(() => $insertTableRow__EXPERIMENTAL(false));
  }
  function insertRowBelow() {
    withTableSelection(() => $insertTableRow__EXPERIMENTAL(true));
  }
  function insertColLeft() {
    withTableSelection(() => $insertTableColumn__EXPERIMENTAL(false));
  }
  function insertColRight() {
    withTableSelection(() => $insertTableColumn__EXPERIMENTAL(true));
  }
  function deleteRow() {
    withTableSelection(() => $deleteTableRow__EXPERIMENTAL());
  }
  function deleteCol() {
    withTableSelection(() => $deleteTableColumn__EXPERIMENTAL());
  }
  function deleteTable() {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      const anchorNode = sel.anchor.getNode();
      const cellNode = $findMatchingParent(anchorNode, $isTableCellNode);
      if (!cellNode) return;
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
      tableNode.remove();
    });
  }
  function toggleHeader() {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      const anchorNode = sel.anchor.getNode();
      const cellNode = $findMatchingParent(anchorNode, $isTableCellNode);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      cellNode.toggleHeaderStyle(TableCellHeaderStates.ROW);
    });
  }

  function insertTable() {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: '3',
      rows: '3',
      includeHeaders: true,
    });
  }

  function insertTextAtCursor(text: string) {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      const fnMatch = text.match(/^\[\^(\d+)\]$/);
      if (fnMatch) {
        const num = Number(fnMatch[1]);
        $insertNodes([$createFootnoteRefNode(num)]);
        const refs: FootnoteRefNode[] = [];
        collectFootnoteRefs($getRoot(), refs);
        refs.forEach((node, idx) => {
          const expected = idx + 1;
          if (node.__number !== expected) {
            const w = node.getWritable();
            w.__number = expected;
          }
        });
        return;
      }
      sel.insertText(text);
    });
  }

  function insertFootnoteAtCursor() {
    if (!onRequestFootnote) return;
    const result = onRequestFootnote(insertTextAtCursor);
    if (typeof result === 'number' && result > 0) {
      insertTextAtCursor(`[^${result}]`);
    }
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

  // H3 usado libera H4. H4 libera H5. H5 libera H6.
  const showH4 = active.h4 || maxHeadingLevel >= 3;
  const showH5 = active.h5 || maxHeadingLevel >= 4;
  const showH6 = active.h6 || maxHeadingLevel >= 5;

  return (
    <div className="border-b border-base-300 bg-base-200">
    <div className="flex flex-wrap gap-1 p-1">
      <ToolbarButton title="Negrito" active={active.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><Bold className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Itálico" active={active.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><Italic className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Riscado" active={active.strikethrough} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}><Strikethrough className="w-3.5 h-3.5" /></ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Título 1" active={active.h1} onClick={() => applyHeading('h1')}><Heading1 className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Título 2" active={active.h2} onClick={() => applyHeading('h2')}><Heading2 className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Título 3" active={active.h3} onClick={() => applyHeading('h3')}><Heading3 className="w-3.5 h-3.5" /></ToolbarButton>
      {showH4 && <ToolbarButton title="Título 4" active={active.h4} onClick={() => applyHeading('h4')}><Heading4 className="w-3.5 h-3.5" /></ToolbarButton>}
      {showH5 && <ToolbarButton title="Título 5" active={active.h5} onClick={() => applyHeading('h5')}><Heading5 className="w-3.5 h-3.5" /></ToolbarButton>}
      {showH6 && <ToolbarButton title="Título 6" active={active.h6} onClick={() => applyHeading('h6')}><Heading6 className="w-3.5 h-3.5" /></ToolbarButton>}
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Alinhar à esquerda" active={active.alignLeft} onClick={() => applyAlign('left')}><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Centralizar" active={active.alignCenter} onClick={() => applyAlign('center')}><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Alinhar à direita" active={active.alignRight} onClick={() => applyAlign('right')}><AlignRight className="w-3.5 h-3.5" /></ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Lista" active={active.ul} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Lista numerada" active={active.ol} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Citação" active={active.quote} onClick={applyQuote}><Quote className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Código" active={active.code} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}><Code className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton title="Inserir tabela" onClick={insertTable}><Table className="w-3.5 h-3.5" /></ToolbarButton>
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

    {inTable && (
      <div className="flex flex-wrap gap-1 p-1 border-t border-base-300 bg-base-300/40">
        <span className="text-[10px] uppercase font-bold opacity-50 self-center px-1">Tabela</span>
        <ToolbarButton title="Linha acima" onClick={insertRowAbove}><ArrowUpFromLine className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton title="Linha abaixo" onClick={insertRowBelow}><ArrowDownFromLine className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton title="Remover linha" onClick={deleteRow}><Rows3 className="w-3.5 h-3.5 text-error" /></ToolbarButton>
        <span className="border-r border-base-300 mx-1" />
        <ToolbarButton title="Coluna à esquerda" onClick={insertColLeft}><ArrowLeftFromLine className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton title="Coluna à direita" onClick={insertColRight}><ArrowRightFromLine className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton title="Remover coluna" onClick={deleteCol}><Columns3 className="w-3.5 h-3.5 text-error" /></ToolbarButton>
        <span className="border-r border-base-300 mx-1" />
        <ToolbarButton title={cellIsHeader ? 'Remover cabeçalho da linha' : 'Marcar linha como cabeçalho'} active={cellIsHeader} onClick={toggleHeader}><Heading className="w-3.5 h-3.5" /></ToolbarButton>
        <span className="border-r border-base-300 mx-1" />
        <ToolbarButton title="Remover tabela" onClick={deleteTable}><Trash2 className="w-3.5 h-3.5 text-error" /></ToolbarButton>
      </div>
    )}
    </div>
  );
}
