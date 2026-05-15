/**
 * Conversão BookBlock[] ↔ markdown string.
 *
 * Permite que o editor seja UMA área única de markdown (Lexical) e o save
 * detecte automaticamente parágrafos, títulos, citações, listas, código e imagens.
 * Numeração canônica continua sendo aplicada por `BookEntity.numberChapter`
 * depois de parsear.
 */

import { BookBlock, BookBlockKind } from '@/domain/library/types';

function gid(): string {
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class BlockMarkdownEntity {
  /** Parseia uma string markdown em blocos estruturados. */
  static parse(md: string): BookBlock[] {
    const lines = (md ?? '').split('\n');
    const blocks: BookBlock[] = [];
    let buffer: string[] = [];
    let mode: 'paragraph' | 'code' | 'quote' | 'list' | null = null;

    function flush() {
      if (buffer.length === 0) return;
      const content = buffer.join('\n').trimEnd();
      if (!content) {
        buffer = [];
        return;
      }
      if (mode === 'code') {
        blocks.push({ id: gid(), kind: 'code', content });
      } else if (mode === 'quote') {
        blocks.push({ id: gid(), kind: 'quote', content });
      } else if (mode === 'list') {
        blocks.push({ id: gid(), kind: 'list', content });
      } else {
        blocks.push({ id: gid(), kind: 'paragraph', content });
      }
      buffer = [];
      mode = null;
    }

    for (const raw of lines) {
      const line = raw.replace(/\r$/, '');

      // Code fence ``` ```
      if (line.trim().startsWith('```')) {
        if (mode === 'code') {
          flush();
        } else {
          flush();
          mode = 'code';
        }
        continue;
      }
      if (mode === 'code') {
        buffer.push(line);
        continue;
      }

      // Heading (# até ######)
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flush();
        blocks.push({
          id: gid(),
          kind: 'heading',
          heading_level: heading[1].length,
          content: heading[2].trim(),
        });
        continue;
      }

      // Imagem standalone — só se for a única coisa na linha
      const image = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
      if (image) {
        flush();
        const caption = image[1];
        const url = image[2];
        blocks.push({
          id: gid(),
          kind: 'image_ref',
          content: caption ? `${url}|${caption}` : url,
        });
        continue;
      }

      // Blockquote
      if (line.startsWith('> ') || line === '>') {
        if (mode !== 'quote') flush();
        mode = 'quote';
        buffer.push(line.replace(/^>\s?/, ''));
        continue;
      }

      // List items (ul/ol)
      if (line.match(/^(\s*)([-*+]|\d+\.)\s+/)) {
        if (mode !== 'list') flush();
        mode = 'list';
        buffer.push(line);
        continue;
      }

      // Linha em branco — separa blocos
      if (line.trim() === '') {
        flush();
        continue;
      }

      // Caso geral — parágrafo
      if (mode !== 'paragraph') flush();
      mode = 'paragraph';
      buffer.push(line);
    }

    flush();
    return blocks;
  }

  /** Serializa blocos de volta em markdown (preservando estrutura). */
  static stringify(blocks: BookBlock[]): string {
    const parts = blocks.map(b => {
      switch (b.kind) {
        case 'heading': {
          const level = Math.min(6, Math.max(1, b.heading_level ?? 2));
          return `${'#'.repeat(level)} ${b.content}`;
        }
        case 'paragraph':
          return b.content;
        case 'quote':
          return b.content.split('\n').map(l => `> ${l}`).join('\n');
        case 'list':
          return b.content;
        case 'code':
          return '```\n' + b.content + '\n```';
        case 'image_ref': {
          const [url, ...captionParts] = (b.content ?? '').split('|');
          const caption = captionParts.join('|');
          return `![${caption}](${url})`;
        }
        default:
          return b.content;
      }
    });
    return parts.join('\n\n');
  }

  /** Lista os kinds que ganham número canônico (paragraph + quote). */
  static numberedKinds(): BookBlockKind[] {
    return ['paragraph', 'quote'];
  }
}
