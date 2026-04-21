'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  preview?: 'edit' | 'preview' | 'live';
}

// Lista de temas DaisyUI considerados escuros
const DARK_THEMES = new Set([
  'dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula',
  'business', 'night', 'coffee', 'dim', 'sunset', 'abyss',
]);

function detectColorMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme && DARK_THEMES.has(theme)) return 'dark';
  if (theme) return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function MarkdownField({
  value,
  onChange,
  placeholder,
  height = 200,
  disabled = false,
  preview = 'edit',
}: MarkdownFieldProps) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const update = () => {
      const mode = detectColorMode();
      setColorMode(mode);
      // MDEditor lê data-color-mode do <html> — fullscreen escapa de wrappers
      document.documentElement.setAttribute('data-color-mode', mode);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="markdown-field wmde-markdown-var rounded-lg overflow-hidden border border-base-300"
      data-color-mode={colorMode}
    >
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={height}
        preview={preview}
        textareaProps={{ placeholder, disabled }}
      />
    </div>
  );
}
