'use client';

import * as React from 'react';
import {
  DecoratorNode,
  type NodeKey,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type { TextMatchTransformer } from '@lexical/markdown';

type SerializedFootnoteRefNode = Spread<
  { number: number },
  SerializedLexicalNode
>;

/**
 * Inline DecoratorNode pra marker de footnote.
 * Renderiza como ¹ (superscript) no editor.
 * Serializa como [^N] no markdown.
 */
export class FootnoteRefNode extends DecoratorNode<React.JSX.Element> {
  __number: number;

  static getType(): string {
    return 'footnote-ref';
  }

  static clone(node: FootnoteRefNode): FootnoteRefNode {
    return new FootnoteRefNode(node.__number, node.__key);
  }

  constructor(num: number, key?: NodeKey) {
    super(key);
    this.__number = num;
  }

  static importJSON(serialized: SerializedFootnoteRefNode): FootnoteRefNode {
    return new FootnoteRefNode(serialized.number);
  }

  exportJSON(): SerializedFootnoteRefNode {
    return {
      type: 'footnote-ref',
      version: 1,
      number: this.__number,
    };
  }

  /** Inline — fica no fluxo de texto. */
  isInline(): true {
    return true;
  }

  isKeyboardSelectable(): true {
    return true;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.JSX.Element {
    return (
      <sup
        contentEditable={false}
        title={`Nota ${this.__number}`}
        style={{
          color: 'oklch(var(--p))',
          fontWeight: 600,
          padding: '0 2px',
          fontSize: '0.75em',
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        {this.__number}
      </sup>
    );
  }

  getTextContent(): string {
    // Quando user copia o texto, mantém como [^N] (round-trip)
    return `[^${this.__number}]`;
  }
}

export function $createFootnoteRefNode(num: number): FootnoteRefNode {
  return new FootnoteRefNode(num);
}

export function $isFootnoteRefNode(node: LexicalNode | null | undefined): node is FootnoteRefNode {
  return node instanceof FootnoteRefNode;
}

/** Transformer markdown ↔ FootnoteRefNode via [^N]. */
export const FOOTNOTE_REF_TRANSFORMER: TextMatchTransformer = {
  dependencies: [FootnoteRefNode],
  export: (node) => {
    if (!$isFootnoteRefNode(node)) return null;
    return `[^${node.__number}]`;
  },
  importRegExp: /\[\^(\d+)\]/,
  regExp: /\[\^(\d+)\]$/,
  replace: (textNode, match) => {
    const num = Number(match[1]);
    if (!Number.isFinite(num) || num < 1) return;
    const fnNode = $createFootnoteRefNode(num);
    textNode.replace(fnNode);
  },
  trigger: ']',
  type: 'text-match',
};
