'use client';

import { useEffect, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';
import {
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Undo, Redo, ImagePlus,
} from 'lucide-react';
import { MediaPickerModal } from '@/shared/components/MediaPickerModal';
import { ImageNode, $createImageNode, IMAGE_TRANSFORMER } from './ImageNode';

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

const editorTheme = {
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

export function RichTextEditor({ value, onChange, placeholder, height = 200, disabled }: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: editorTheme,
    onError: (err: Error) => console.error('[Lexical]', err),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, LinkNode, ImageNode],
    editable: !disabled,
  };

  const transformers = [IMAGE_TRANSFORMER, ...TRANSFORMERS];

  return (
    <div className="rounded-lg border border-base-300 overflow-hidden bg-base-100">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative" style={{ height }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none p-3 h-full overflow-y-auto text-base-content text-sm"
                aria-placeholder={placeholder ?? 'Comece a escrever...'}
                placeholder={
                  <div className="absolute top-3 left-3 pointer-events-none text-base-content/40 text-sm">
                    {placeholder ?? 'Comece a escrever...'}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={transformers} />
        <EnsureParagraphAfterImagePlugin />
        <LoadInitialMarkdown markdown={value} transformers={transformers} />
        <MarkdownExport onChange={onChange} transformers={transformers} />
      </LexicalComposer>
    </div>
  );
}

function LoadInitialMarkdown({ markdown, transformers }: { markdown: string; transformers: typeof TRANSFORMERS }) {
  const [editor] = useLexicalComposerContext();
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    editor.update(() => {
      $convertFromMarkdownString(markdown ?? '', transformers);
    });
  }, [editor, markdown, transformers]);
  return null;
}

/**
 * Garante que toda ImageNode tenha sempre um ParagraphNode irmão depois.
 * Sem isso, o cursor não consegue pousar abaixo da imagem e o usuário
 * não consegue continuar escrevendo após inserir uma figura.
 */
function EnsureParagraphAfterImagePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerNodeTransform(ImageNode, node => {
      const next = node.getNextSibling();
      if (!next) {
        const p = $createParagraphNode();
        node.insertAfter(p);
        return;
      }
      // Se for outra imagem direto (sem paragraph entre), insere um paragraph entre
      if (next instanceof ImageNode) {
        const p = $createParagraphNode();
        node.insertAfter(p);
      }
    });
  }, [editor]);
  return null;
}

function MarkdownExport({ onChange, transformers }: { onChange: (md: string) => void; transformers: typeof TRANSFORMERS }) {
  return (
    <OnChangePlugin
      onChange={editorState => {
        editorState.read(() => {
          const md = $convertToMarkdownString(transformers);
          onChange(md);
        });
      }}
    />
  );
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [imageOpen, setImageOpen] = useState(false);

  function applyHeading(tag: 'h1' | 'h2' | 'h3') {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  }

  function applyQuote() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }

  function insertImageMarkdown(url: string, alt: string) {
    editor.update(() => {
      const imageNode = $createImageNode(url, alt);
      const trailingParagraph = $createParagraphNode();
      $insertNodes([imageNode, trailingParagraph]);
      // Move cursor pro parágrafo vazio depois da imagem
      trailingParagraph.selectStart();
    });
    setImageOpen(false);
  }

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-base-300 bg-base-200">
      <ToolbarButton title="Negrito" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Itálico" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Riscado" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}>
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Título 1" onClick={() => applyHeading('h1')}>
        <Heading1 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Título 2" onClick={() => applyHeading('h2')}>
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Título 3" onClick={() => applyHeading('h3')}>
        <Heading3 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Lista" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Lista numerada" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Citação" onClick={applyQuote}>
        <Quote className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Código" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}>
        <Code className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Inserir imagem" onClick={() => setImageOpen(true)}>
        <ImagePlus className="w-3.5 h-3.5" />
      </ToolbarButton>
      <span className="border-r border-base-300 mx-1" />
      <ToolbarButton title="Desfazer" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <Undo className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Refazer" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <Redo className="w-3.5 h-3.5" />
      </ToolbarButton>

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

function ToolbarButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="btn btn-ghost btn-xs p-1 min-h-0 h-7"
    >
      {children}
    </button>
  );
}
