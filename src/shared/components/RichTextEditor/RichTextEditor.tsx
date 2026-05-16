'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { editorTheme, editorNodes, markdownTransformers } from './utils/editorConfig';
import { LoadInitialMarkdown } from './plugins/LoadInitialMarkdown';
import { EnsureParagraphAfterImagePlugin } from './plugins/EnsureParagraphAfterImage';
import { MarkdownExport } from './plugins/MarkdownExport';
import { Toolbar } from './components/Toolbar';
import { FootnoteRenumberPlugin } from './components/FootnoteRenumberPlugin';
import { TableCellResizerPlugin } from './plugins/TableCellResizerPlugin';

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  /**
   * When provided, shows footnote button in toolbar.
   * Receives `insertAtCursor`. Return number > 0 auto-inserts [^N];
   * void/null = parent handles insertion (e.g. opens picker modal).
   */
  onRequestFootnote?: (insertAtCursor: (text: string) => void) => number | void;
  /** When provided, shows citation button. Receives `insertAtCursor` callback. */
  onRequestCitation?: (insertAtCursor: (text: string) => void) => void;
}

export function RichTextEditor({
  value, onChange, placeholder, height = 200, disabled, onRequestFootnote, onRequestCitation,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: editorTheme,
    onError: (err: Error) => console.error('[Lexical]', err),
    nodes: editorNodes,
    editable: !disabled,
  };

  return (
    <div className="rounded-lg border border-base-300 overflow-hidden bg-base-100">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar onRequestFootnote={onRequestFootnote} onRequestCitation={onRequestCitation} />
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
        <TablePlugin hasCellMerge hasCellBackgroundColor={false} hasTabHandler />
        <TableCellResizerPlugin />
        <MarkdownShortcutPlugin transformers={markdownTransformers} />
        <EnsureParagraphAfterImagePlugin />
        <FootnoteRenumberPlugin />
        <LoadInitialMarkdown markdown={value} transformers={markdownTransformers} />
        <MarkdownExport onChange={onChange} transformers={markdownTransformers} />
      </LexicalComposer>
    </div>
  );
}
