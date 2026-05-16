'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $isTableCellNode, $isTableNode, $isTableRowNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableColumnIndexFromTableCellNode,
} from '@lexical/table';
import { $getNearestNodeFromDOMNode, $getNodeByKey } from 'lexical';

const RESIZE_HANDLE_PX = 8;
const RESIZE_HANDLE_TOUCH_PX = 14; // área maior pra toque
const MIN_COL_WIDTH = 50;
const DEFAULT_COL_WIDTH = 120;

interface DragState {
  tableKey: string;
  colIdx: number;
  startX: number;
  startWidth: number;
  pointerId: number;
}

function isTouchPointer(e: PointerEvent): boolean {
  return e.pointerType === 'touch' || e.pointerType === 'pen';
}

export function TableCellResizerPlugin() {
  const [editor] = useLexicalComposerContext();
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    function findCell(target: EventTarget | null): HTMLTableCellElement | null {
      if (!(target instanceof Element)) return null;
      return target.closest('td, th') as HTMLTableCellElement | null;
    }

    function isOnRightEdge(cell: HTMLTableCellElement, clientX: number, touch: boolean): boolean {
      const rect = cell.getBoundingClientRect();
      const threshold = touch ? RESIZE_HANDLE_TOUCH_PX : RESIZE_HANDLE_PX;
      return clientX >= rect.right - threshold && clientX <= rect.right + threshold;
    }

    // Hover (só mouse) — só ativo quando NÃO há drag
    function onRootPointerMove(e: PointerEvent) {
      if (dragRef.current) return;
      if (isTouchPointer(e)) return; // touch não usa hover
      const cell = findCell(e.target);
      if (cell && isOnRightEdge(cell, e.clientX, false)) {
        cell.style.cursor = 'col-resize';
      } else if (cell) {
        cell.style.cursor = '';
      }
    }

    function onRootPointerDown(e: PointerEvent) {
      const cell = findCell(e.target);
      if (!cell) return;
      const touch = isTouchPointer(e);
      if (!isOnRightEdge(cell, e.clientX, touch)) return;
      e.preventDefault();
      e.stopPropagation();

      let tableKey = '';
      let colIdx = -1;
      let startWidth = cell.getBoundingClientRect().width;

      editor.read(() => {
        const cellNode = $getNearestNodeFromDOMNode(cell);
        if (!cellNode || !$isTableCellNode(cellNode)) return;
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
        tableKey = tableNode.getKey();
        colIdx = $getTableColumnIndexFromTableCellNode(cellNode);
        const widths = tableNode.getColWidths();
        if (widths && widths[colIdx]) startWidth = widths[colIdx];
      });

      if (!tableKey || colIdx < 0) return;
      dragRef.current = { tableKey, colIdx, startX: e.clientX, startWidth, pointerId: e.pointerId };
      // Captura pointer pra receber move/up mesmo fora do elemento
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';
    }

    function onDocumentPointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      const dx = e.clientX - drag.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, drag.startWidth + dx);
      editor.update(() => {
        const tableNode = $getNodeByKey(drag.tableKey);
        if (!tableNode || !$isTableNode(tableNode)) return;
        const firstRow = tableNode.getFirstChild();
        const colCount = firstRow && $isTableRowNode(firstRow)
          ? firstRow.getChildren().length
          : 0;
        const widths = (tableNode.getColWidths() ?? []).slice();
        while (widths.length < colCount) widths.push(DEFAULT_COL_WIDTH);
        if (drag.colIdx < widths.length) {
          widths[drag.colIdx] = newWidth;
          tableNode.setColWidths(widths);
        }
      });
    }

    function onDocumentPointerUp(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    }

    root.addEventListener('pointermove', onRootPointerMove);
    root.addEventListener('pointerdown', onRootPointerDown);
    document.addEventListener('pointermove', onDocumentPointerMove);
    document.addEventListener('pointerup', onDocumentPointerUp);
    document.addEventListener('pointercancel', onDocumentPointerUp);
    return () => {
      root.removeEventListener('pointermove', onRootPointerMove);
      root.removeEventListener('pointerdown', onRootPointerDown);
      document.removeEventListener('pointermove', onDocumentPointerMove);
      document.removeEventListener('pointerup', onDocumentPointerUp);
      document.removeEventListener('pointercancel', onDocumentPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };
  }, [editor]);

  return null;
}
