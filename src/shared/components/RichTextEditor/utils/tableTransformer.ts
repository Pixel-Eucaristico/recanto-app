import { $createParagraphNode, $createTextNode, $isElementNode, type ElementNode, type LexicalNode } from 'lexical';
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  $isTableNode,
  $isTableRowNode,
  $isTableCellNode,
  TableCellHeaderStates,
  TableNode,
  TableRowNode,
  TableCellNode,
} from '@lexical/table';
import type { MultilineElementTransformer } from '@lexical/markdown';

const TABLE_ROW = /^\|(.+)\|\s*$/;
const TABLE_DIVIDER = /^\|(?:\s*:?-+:?\s*\|)+\s*$/;

function splitCells(line: string): string[] {
  const match = line.match(TABLE_ROW);
  if (!match) return [];
  return match[1].split('|').map(s => s.trim());
}

function isTableRow(line: string): boolean {
  return TABLE_ROW.test(line);
}

function isTableDivider(line: string): boolean {
  return TABLE_DIVIDER.test(line);
}

function getCellText(cell: TableCellNode): string {
  return cell.getChildren()
    .map(child => child.getTextContent())
    .join(' ')
    .replace(/\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function buildTableNode(rows: string[][], hasHeader: boolean): TableNode | null {
  if (rows.length === 0) return null;
  const maxCols = Math.max(...rows.map(r => r.length));
  const tableNode = $createTableNode();
  rows.forEach((cells, rowIdx) => {
    const rowNode = $createTableRowNode();
    const isHeader = hasHeader && rowIdx === 0;
    for (let c = 0; c < maxCols; c++) {
      const text = cells[c] ?? '';
      const cellNode = $createTableCellNode(
        isHeader ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS,
      );
      const para = $createParagraphNode();
      if (text.length > 0) para.append($createTextNode(text));
      cellNode.append(para);
      rowNode.append(cellNode);
    }
    tableNode.append(rowNode);
  });
  return tableNode;
}

export const TABLE_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],

  // Start: linha que comece e termine com |
  regExpStart: /^\|(.+)\|\s*$/,
  // End: opcional — controle real é via handleImportAfterStartMatch
  regExpEnd: { optional: true, regExp: /^\s*$/ },

  /**
   * Import controlado: lê linhas a partir de startLineIndex até encontrar
   * linha que não seja row/divider de tabela. Cria TableNode e appenda ao root.
   */
  handleImportAfterStartMatch({ lines, rootNode, startLineIndex }) {
    // Coleta linhas válidas a partir do startLineIndex
    const tableLines: string[] = [];
    let i = startLineIndex;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (isTableRow(trimmed) || isTableDivider(trimmed)) {
        tableLines.push(trimmed);
        i++;
      } else {
        break;
      }
    }
    if (tableLines.length < 1) return [false, startLineIndex];

    // Separa divider das rows
    let dividerSeen = false;
    const dataRows: string[][] = [];
    for (const line of tableLines) {
      if (isTableDivider(line)) {
        dividerSeen = true;
        continue;
      }
      const cells = splitCells(line);
      if (cells.length > 0) dataRows.push(cells);
    }
    if (dataRows.length === 0) return [false, startLineIndex];

    const tableNode = buildTableNode(dataRows, dividerSeen);
    if (!tableNode) return [false, startLineIndex];

    rootNode.append(tableNode);
    return [true, i];
  },

  export(node: LexicalNode): string | null {
    if (!$isTableNode(node)) return null;
    const rows = node.getChildren().filter($isTableRowNode);
    if (rows.length === 0) return null;
    const lines: string[] = [];
    let columnCount = 0;
    rows.forEach((row, rowIdx) => {
      const cells = row.getChildren().filter($isTableCellNode);
      const texts = cells.map(getCellText);
      if (texts.length > columnCount) columnCount = texts.length;
      lines.push(`| ${texts.map(t => t || ' ').join(' | ')} |`);
      if (rowIdx === 0) {
        lines.push(`|${' --- |'.repeat(texts.length)}`);
      }
    });
    if (columnCount === 0) return null;
    return lines.join('\n');
  },

  // `replace` requerido pelo type, mas controle está em handleImportAfterStartMatch
  replace(parentNode: ElementNode) {
    if ($isElementNode(parentNode) && parentNode.getChildrenSize() === 0) {
      parentNode.remove();
    }
    return true;
  },

  type: 'multiline-element',
};
