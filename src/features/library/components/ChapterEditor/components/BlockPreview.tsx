'use client';

import type { BookChapter } from '@/domain/library/types';
import { RichContent } from '@/shared/components/RichContent';

interface BlockPreviewProps {
  block: BookChapter['blocks'][number];
}

export function BlockPreview({ block }: BlockPreviewProps) {
  const ref = block.ref;

  if (block.kind === 'heading') {
    const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold',
      2: 'text-xl font-bold',
      3: 'text-lg font-semibold',
      4: 'text-base font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-xs font-semibold uppercase',
    };
    return <p className={`${sizes[level]} my-2 text-base-content`}>{block.content}</p>;
  }

  if (block.kind === 'paragraph') {
    return (
      <p className="text-sm text-base-content flex gap-2">
        {ref && <span className="badge badge-primary badge-xs flex-shrink-0 mt-1">{ref}</span>}
        <span>{block.content}</span>
      </p>
    );
  }

  if (block.kind === 'quote') {
    return (
      <blockquote className="border-l-4 border-primary pl-3 italic text-base-content/80 my-2 flex gap-2">
        {ref && <span className="badge badge-primary badge-xs flex-shrink-0 mt-1 not-italic">{ref}</span>}
        <span>{block.content}</span>
      </blockquote>
    );
  }

  if (block.kind === 'list') {
    return <RichContent markdown={block.content} className="text-sm" />;
  }

  if (block.kind === 'code') {
    return (
      <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto my-2">
        <code>{block.content}</code>
      </pre>
    );
  }

  if (block.kind === 'image_ref') {
    const [url, ...captionParts] = (block.content ?? '').split('|');
    const caption = captionParts.join('|');
    return (
      <figure className="my-3 flex flex-col items-center w-full">
        {url && <img src={url} alt={caption || 'imagem'} className="block rounded-lg max-w-full max-h-96 object-contain" />}
        {caption && <figcaption className="block w-full text-xs text-base-content/60 mt-2 text-center italic">{caption}</figcaption>}
      </figure>
    );
  }

  return null;
}
