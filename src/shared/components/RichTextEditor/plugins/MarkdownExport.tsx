'use client';

import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $convertToMarkdownString } from '@lexical/markdown';
import type { TRANSFORMERS } from '@lexical/markdown';

interface MarkdownExportProps {
  onChange: (md: string) => void;
  transformers: typeof TRANSFORMERS;
}

export function MarkdownExport({ onChange, transformers }: MarkdownExportProps) {
  return (
    <OnChangePlugin
      onChange={editorState => {
        editorState.read(() => {
          onChange($convertToMarkdownString(transformers));
        });
      }}
    />
  );
}
