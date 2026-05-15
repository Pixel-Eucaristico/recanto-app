'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, type LexicalNode } from 'lexical';
import { FootnoteRefNode, $isFootnoteRefNode } from '../FootnoteRefNode';

function collect(node: LexicalNode, out: FootnoteRefNode[]): void {
  if ($isFootnoteRefNode(node)) { out.push(node); return; }
  const e = node as { getChildren?: () => LexicalNode[] };
  if (typeof e.getChildren === 'function') {
    for (const c of e.getChildren()) collect(c, out);
  }
}

/**
 * Mantém todos FootnoteRefNode numerados sequencialmente 1..N por ordem de documento.
 * Dispara em mutations (insert/delete/update) — usa flag pra evitar loop.
 */
export function FootnoteRenumberPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let renumbering = false;

    return editor.registerMutationListener(FootnoteRefNode, () => {
      if (renumbering) return; // evita loop dentro do próprio update
      renumbering = true;
      editor.update(() => {
        const refs: FootnoteRefNode[] = [];
        collect($getRoot(), refs);
        refs.forEach((node, idx) => {
          const expected = idx + 1;
          if (node.__number !== expected) {
            const w = node.getWritable();
            w.__number = expected;
          }
        });
      }, { onUpdate: () => { renumbering = false; } });
    });
  }, [editor]);

  return null;
}
