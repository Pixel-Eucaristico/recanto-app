'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InlineMarkdownProps {
  markdown: string;
  className?: string;
}

const inlineComponents: Components = {
  p: ({ children }) => <>{children}</>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children }) => <>{children}</>,
  img: () => null,
};

export function InlineMarkdown({ markdown, className = '' }: InlineMarkdownProps) {
  return (
    <span className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={inlineComponents}
        skipHtml
        unwrapDisallowed
      >
        {markdown || ''}
      </ReactMarkdown>
    </span>
  );
}
