import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { TRANSFORMERS } from '@lexical/markdown';
import { ImageNode, IMAGE_TRANSFORMER } from '../ImageNode';
import { FootnoteRefNode, FOOTNOTE_REF_TRANSFORMER } from '../FootnoteRefNode';
import { TABLE_TRANSFORMER } from './tableTransformer';

export const editorTheme = {
  paragraph: 'mb-2 min-h-[1.5em]',
  heading: {
    h1: 'text-2xl font-bold mb-2',
    h2: 'text-xl font-bold mb-2',
    h3: 'text-lg font-semibold mb-2',
    h4: 'text-base font-semibold mb-2',
    h5: 'text-sm font-semibold mb-2',
    h6: 'text-xs font-semibold uppercase tracking-wide mb-2',
  },
  list: {
    ul: 'list-disc list-inside mb-2',
    ol: 'list-decimal list-inside mb-2',
    listitem: 'ml-4',
  },
  quote: 'border-l-4 border-primary pl-3 italic text-base-content/80 my-2',
  code: 'bg-base-200 px-1 rounded font-mono text-sm',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
  },
  link: 'text-primary underline',
  table: 'table-auto border-collapse my-3 w-full',
  tableRow: 'border-b border-base-300',
  tableCell: 'border border-base-300 px-2 py-1 align-top',
  tableCellHeader: 'border border-base-300 px-2 py-1 bg-base-200 font-semibold text-left',
};

export const editorNodes = [
  HeadingNode, QuoteNode, ListNode, ListItemNode,
  CodeNode, CodeHighlightNode, LinkNode, ImageNode, FootnoteRefNode,
  TableNode, TableCellNode, TableRowNode,
];

// Footnote transformer ANTES dos default — pra interceptar [^N] antes de outros matchers
// TABLE_TRANSFORMER multiline também antes pra capturar `| col | col |` GFM
export const markdownTransformers = [TABLE_TRANSFORMER, IMAGE_TRANSFORMER, FOOTNOTE_REF_TRANSFORMER, ...TRANSFORMERS];
