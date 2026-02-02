'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Componente padronizado para renderizar Markdown e HTML (estilo WhatsApp/MD comum)
 * Suporta negrito (* ou __), itálico (_ ou *), riscado (~~), e também tags HTML legadas.
 */
export function MarkdownRenderer({ 
  content, 
  className = '', 
  as: Tag = 'div',
  inline = false
}: MarkdownRendererProps & { as?: any; inline?: boolean }) {
  if (!content) return null;

  return (
    <Tag className={`markdown-content ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={inline ? {
          p: ({ node, ...props }) => <span {...props} />,
        } : {}}
      >
        {content}
      </ReactMarkdown>
    </Tag>
  );
}
