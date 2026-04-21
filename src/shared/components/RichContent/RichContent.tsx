'use client';

import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseVideoSource } from '@/features/video-player/utils/parseVideoSource';

interface RichContentProps {
  markdown: string;
  className?: string;
}

/**
 * Renderer de Markdown com extras:
 * - Links para YouTube viram embed iframe inline (sem branding completo).
 * - Imagens via `![alt](url)` renderizam com `max-w-full rounded`.
 * - Tabelas / strikethrough / checklists via `remark-gfm`.
 */
const components: Components = {
  a: ({ href, children, ...props }) => {
    if (!href) return <a {...props}>{children}</a>;
    const src = parseVideoSource(href);
    if (src.kind === 'youtube') {
      return (
        <span className="block my-3 rounded-xl overflow-hidden aspect-video bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${src.value}?modestbranding=1&rel=0&iv_load_policy=3`}
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </span>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="link link-primary" {...props}>
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => (
    <img
      src={typeof src === 'string' ? src : undefined}
      alt={alt ?? ''}
      className="max-w-full rounded-xl my-3"
      {...props}
    />
  ),
};

export function RichContent({ markdown, className = '' }: RichContentProps) {
  return (
    <div className={`prose prose-sm max-w-none text-base-content [&_*]:text-inherit ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown || ''}
      </ReactMarkdown>
    </div>
  );
}
