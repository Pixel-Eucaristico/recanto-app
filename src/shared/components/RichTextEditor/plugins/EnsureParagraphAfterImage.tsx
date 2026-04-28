'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode } from 'lexical';
import { ImageNode } from '../ImageNode';

export function EnsureParagraphAfterImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(ImageNode, node => {
      const next = node.getNextSibling();
      if (!next) {
        node.insertAfter($createParagraphNode());
        return;
      }
      if (next instanceof ImageNode) {
        node.insertAfter($createParagraphNode());
      }
    });
  }, [editor]);

  return null;
}
