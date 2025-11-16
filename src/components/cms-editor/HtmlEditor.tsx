'use client';

import { useState, useRef } from 'react';
import { Bold, Italic, List, Link2, Type } from 'lucide-react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/**
 * Editor HTML amigável com botões para tags comuns
 * Muito mais intuitivo que escrever HTML manualmente!
 */
export function HtmlEditor({ value, onChange, placeholder, rows = 6 }: HtmlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string, placeholder = 'texto') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newValue =
      value.substring(0, start) +
      openTag +
      textToInsert +
      closeTag +
      value.substring(end);

    onChange(newValue);

    // Reposicionar cursor
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start, start + openTag.length + textToInsert.length + closeTag.length);
      } else {
        textarea.setSelectionRange(start + openTag.length, start + openTag.length + textToInsert.length);
      }
      textarea.focus();
    }, 0);
  };

  const insertLineBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + '<br/>' + value.substring(start);
    onChange(newValue);

    setTimeout(() => {
      textarea.setSelectionRange(start + 5, start + 5);
      textarea.focus();
    }, 0);
  };

  const wrapInParagraph = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
      insertTag('<p>', '</p>', 'Parágrafo aqui');
      return;
    }

    const newValue =
      value.substring(0, start) +
      '<p>' +
      selectedText +
      '</p>' +
      value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.setSelectionRange(start, start + 3 + selectedText.length + 4);
      textarea.focus();
    }, 0);
  };

  const insertListItem = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const listHtml = `<p>- Item 1<br/>- Item 2<br/>- Item 3</p>`;
    const newValue = value.substring(0, start) + listHtml + value.substring(start);
    onChange(newValue);

    setTimeout(() => {
      textarea.setSelectionRange(start + 6, start + 12);
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap gap-1 p-2 bg-base-200 rounded-lg border border-base-300">
        <button
          type="button"
          onClick={wrapInParagraph}
          className="btn btn-sm btn-ghost gap-1"
          title="Parágrafo <p>"
        >
          <Type className="w-4 h-4" />
          <span className="text-xs">Parágrafo</span>
        </button>

        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>', 'negrito')}
          className="btn btn-sm btn-ghost gap-1"
          title="Negrito <strong>"
        >
          <Bold className="w-4 h-4" />
          <span className="text-xs">Negrito</span>
        </button>

        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>', 'itálico')}
          className="btn btn-sm btn-ghost gap-1"
          title="Itálico <em>"
        >
          <Italic className="w-4 h-4" />
          <span className="text-xs">Itálico</span>
        </button>

        <button
          type="button"
          onClick={insertLineBreak}
          className="btn btn-sm btn-ghost"
          title="Quebra de linha <br/>"
        >
          <span className="text-xs">↵ Quebra</span>
        </button>

        <button
          type="button"
          onClick={insertListItem}
          className="btn btn-sm btn-ghost gap-1"
          title="Lista com -"
        >
          <List className="w-4 h-4" />
          <span className="text-xs">Lista</span>
        </button>

        <button
          type="button"
          onClick={() => insertTag('<a href="', '">link</a>', 'https://exemplo.com')}
          className="btn btn-sm btn-ghost gap-1"
          title="Link <a>"
        >
          <Link2 className="w-4 h-4" />
          <span className="text-xs">Link</span>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="textarea textarea-bordered w-full font-mono text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{ minHeight: `${rows * 1.5}rem` }}
      />

      {/* Preview */}
      {value && (
        <div className="p-3 bg-base-200 rounded-lg border border-base-300">
          <div className="text-xs font-semibold text-base-content/60 mb-2">Preview:</div>
          <div
            className="text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      )}

      {/* Ajuda */}
      <div className="text-xs text-base-content/60">
        💡 <strong>Dica:</strong> Selecione um texto e clique nos botões acima para adicionar tags.
        Tags suportadas: <code>&lt;p&gt;</code>, <code>&lt;br/&gt;</code>, <code>&lt;strong&gt;</code>,{' '}
        <code>&lt;em&gt;</code>, <code>&lt;a&gt;</code>
      </div>
    </div>
  );
}
