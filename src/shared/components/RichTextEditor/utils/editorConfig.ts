import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { TRANSFORMERS } from '@lexical/markdown';
import { ImageNode, IMAGE_TRANSFORMER } from '../ImageNode';

export const editorTheme = {
  paragraph: 'mb-2 min-h-[1.5em]',
  heading: {
    h1: 'text-2xl font-bold mb-2',
    h2: 'text-xl font-bold mb-2',
    h3: 'text-lg font-semibold mb-2',
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
};

export const editorNodes = [
  HeadingNode, QuoteNode, ListNode, ListItemNode,
  CodeNode, CodeHighlightNode, LinkNode, ImageNode,
];

export const markdownTransformers = [IMAGE_TRANSFORMER, ...TRANSFORMERS];
