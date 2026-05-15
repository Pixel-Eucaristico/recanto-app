'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { $getRoot } from 'lexical';
import type { TRANSFORMERS } from '@lexical/markdown';

interface LoadInitialMarkdownProps {
  markdown: string;
  transformers: typeof TRANSFORMERS;
}

export function LoadInitialMarkdown({ markdown, transformers }: LoadInitialMarkdownProps) {
  const [editor] = useLexicalComposerContext();
  const loadedMarkdown = useRef<string | null>(null);

  useEffect(() => {
    // Carrega markdown quando: (a) primeira vez, OU (b) prop mudou E editor está vazio.
    // Caso (b) lida com data async (ex: reflection carrega depois do mount).
    const incoming = markdown ?? '';
    if (loadedMarkdown.current === incoming) return;

    editor.getEditorState().read(() => {
      const isEmpty = $getRoot().getTextContentSize() === 0;
      if (loadedMarkdown.current !== null && !isEmpty) {
        // Já carregou antes E user editou — não sobrescreve.
        return;
      }
      loadedMarkdown.current = incoming;
      editor.update(() => {
        $convertFromMarkdownString(incoming, transformers);
      });
    });
  }, [editor, markdown, transformers]);

  return null;
}
