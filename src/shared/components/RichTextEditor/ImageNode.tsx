'use client';

import {
  DecoratorNode,
  $getNodeByKey,
  type ElementNode,
  type NodeKey,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementTransformer } from '@lexical/markdown';
import { X, Pencil } from 'lucide-react';
import { useState } from 'react';
import { MediaPickerModal } from '@/shared/components/MediaPickerModal';

type SerializedImageNode = Spread<
  {
    src: string;
    alt: string;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  static importJSON(serialized: SerializedImageNode): ImageNode {
    return new ImageNode(serialized.src, serialized.alt);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
    };
  }

  /** Block-level — quebra linha, não permite texto ao lado. */
  isInline(): false {
    return false;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'block my-3';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return <ImageRenderer nodeKey={this.__key} src={this.__src} alt={this.__alt} />;
  }

  getSrc(): string {
    return this.__src;
  }
  getAlt(): string {
    return this.__alt;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }
  setAlt(alt: string): void {
    const writable = this.getWritable();
    writable.__alt = alt;
  }
}

function ImageRenderer({ nodeKey, src, alt }: { nodeKey: NodeKey; src: string; alt: string }) {
  const [editor] = useLexicalComposerContext();
  const [editOpen, setEditOpen] = useState(false);

  function handleDelete() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) node.remove();
    });
  }

  function applyEdit({ url, alt: newAlt }: { url: string; alt: string }) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isImageNode(node)) {
        if (url !== src) node.setSrc(url);
        if (newAlt !== alt) node.setAlt(newAlt);
      }
    });
    setEditOpen(false);
  }

  return (
    <figure className="relative my-3 w-full flex flex-col items-center group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="btn btn-circle btn-xs btn-primary"
          title="Editar imagem"
          aria-label="Editar imagem"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="btn btn-circle btn-xs btn-error"
          title="Remover imagem"
          aria-label="Remover imagem"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <img
        src={src}
        alt={alt}
        className="block rounded-lg max-w-full max-h-96 object-contain"
      />
      {alt && (
        <figcaption className="block w-full text-xs text-base-content/60 italic text-center mt-2">
          {alt}
        </figcaption>
      )}

      {editOpen && (
        <MediaPickerModal
          mode="edit"
          accept="image"
          folder="library/inline"
          initialUrl={src}
          initialAlt={alt}
          onConfirm={applyEdit}
          onClose={() => setEditOpen(false)}
        />
      )}
    </figure>
  );
}

export function $createImageNode(src: string, alt: string): ImageNode {
  return new ImageNode(src, alt);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

/** Markdown ↔ ImageNode transformer (block-level). Detecta linha `![alt](url)` e converte. */
export const IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) return null;
    return `![${node.getAlt()}](${node.getSrc()})`;
  },
  regExp: /^!\[([^\]]*?)\]\(([^)\s]+)\)\s*$/,
  replace: (parentNode: ElementNode, _children, match) => {
    const [, alt, src] = match;
    const imageNode = $createImageNode(src, alt);
    parentNode.replace(imageNode);
  },
  type: 'element',
};
