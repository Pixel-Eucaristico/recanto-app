'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import type { TRANSFORMERS } from '@lexical/markdown';

interface LoadInitialMarkdownProps {
  markdown: string;
  transformers: typeof TRANSFORMERS;
}

export function LoadInitialMarkdown({ markdown, transformers }: LoadInitialMarkdownProps) {
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
