'use client';

import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { parseVideoSource } from '@/features/lesson/video-player/utils/parseVideoSource';

interface RichContentProps {
  markdown: string;
  className?: string;
}

/**
 * Renderer de Markdown com extras:
 * - Links para YouTube viram embed iframe inline (youtube-nocookie).
 * - Imagens via `![alt](url)` renderizam com estilo consistente.
 * - Tabelas / strikethrough / checklists via `remark-gfm`.
 * - HTML inline permitido (`rehype-raw`) — suporta `<video>` e `<audio>`.
 */
const components: Components = {
  a: ({ href, children, ...props }) => {
    if (!href) return <a {...props}>{children}</a>;
    // Fragment links (#fn1, #anchor) — scroll interno, NÃO abre nova aba
    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          className="link link-primary"
          onClick={e => {
            e.preventDefault();
            const target = document.getElementById(href.slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          {...props}
        >
          {children}
        </a>
      );
    }
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
  img: ({ src, alt, ...props }) => {
    const finalSrc = typeof src === 'string' && src.length > 0 ? src : undefined;
    if (!finalSrc) return null;
    return (
      <img
        src={finalSrc}
        alt={alt ?? ''}
        className="max-w-full rounded-xl my-3"
        {...props}
      />
    );
  },
  video: ({ src, title, ...props }) => {
    const finalSrc = typeof src === 'string' && src.length > 0 ? src : undefined;
    if (!finalSrc) return null;
    return (
      <video
        src={finalSrc}
        controls
        preload="metadata"
        className="max-w-full rounded-xl my-3"
        title={title}
        {...props}
      />
    );
  },
  audio: ({ src, title, ...props }) => {
    const finalSrc = typeof src === 'string' && src.length > 0 ? src : undefined;
    if (!finalSrc) return null;
    return (
      <audio
        src={finalSrc}
        controls
        preload="metadata"
        className="w-full my-3"
        title={title}
        {...props}
      />
    );
  },
};

export function RichContent({ markdown, className = '' }: RichContentProps) {
  return (
    <div className={`prose prose-sm max-w-none text-base-content [&_*]:text-inherit ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {markdown || ''}
      </ReactMarkdown>
    </div>
  );
}
