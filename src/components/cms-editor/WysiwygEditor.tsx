'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, Link2, Type, Code } from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Editor WYSIWYG verdadeiro - What You See Is What You Get
 * Usuário edita visualmente sem ver tags HTML!
 */
export function WysiwygEditor({ value, onChange, placeholder, minHeight = '200px' }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value);

  useEffect(() => {
    if (editorRef.current && !showHtmlSource) {
      // Só atualiza se o conteúdo mudou externamente
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, showHtmlSource]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const toggleBold = () => execCommand('bold');
  const toggleItalic = () => execCommand('italic');
  const insertLineBreak = () => execCommand('insertHTML', '<br/>');

  const insertParagraph = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText) {
        execCommand('insertHTML', `<p>${selectedText}</p>`);
      } else {
        execCommand('insertHTML', '<p>Novo parágrafo</p>');
      }
    }
  };

  const insertList = () => {
    execCommand('insertHTML', '<p>• Item 1<br/>• Item 2<br/>• Item 3</p>');
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const toggleHtmlSource = () => {
    if (showHtmlSource) {
      // Voltando para WYSIWYG
      onChange(htmlSource);
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlSource;
      }
    } else {
      // Indo para HTML source
      if (editorRef.current) {
        setHtmlSource(editorRef.current.innerHTML);
      }
    }
    setShowHtmlSource(!showHtmlSource);
  };

  return (
    <div className="space-y-2">
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap gap-1 p-2 bg-base-200 rounded-lg border border-base-300">
        {!showHtmlSource && (
          <>
            <button
              type="button"
              onClick={insertParagraph}
              className="btn btn-sm btn-ghost gap-1"
              title="Parágrafo <p>"
            >
              <Type className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleBold}
              className="btn btn-sm btn-ghost gap-1"
              title="Negrito"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleItalic}
              className="btn btn-sm btn-ghost gap-1"
              title="Itálico"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={insertLineBreak}
              className="btn btn-sm btn-ghost"
              title="Quebra de linha"
            >
              <span className="text-xs">↵</span>
            </button>

            <button
              type="button"
              onClick={insertList}
              className="btn btn-sm btn-ghost gap-1"
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={insertLink}
              className="btn btn-sm btn-ghost gap-1"
              title="Inserir link"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="ml-auto">
          <button
            type="button"
            onClick={toggleHtmlSource}
            className={`btn btn-sm gap-1 ${showHtmlSource ? 'btn-primary' : 'btn-ghost'}`}
            title={showHtmlSource ? 'Voltar para editor visual' : 'Ver código HTML'}
          >
            <Code className="w-4 h-4" />
            <span className="text-xs">{showHtmlSource ? 'Visual' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor ou Código Fonte */}
      {showHtmlSource ? (
        <textarea
          className="textarea textarea-bordered w-full font-mono text-sm"
          value={htmlSource}
          onChange={(e) => setHtmlSource(e.target.value)}
          rows={10}
          style={{ minHeight }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="textarea textarea-bordered w-full p-4 overflow-auto"
          style={{ minHeight }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      )}

      {/* Dica */}
      <div className="text-xs text-base-content/60">
        💡 <strong>Editor Visual:</strong> Selecione o texto e clique nos botões para formatar.
        Clique em "HTML" para ver/editar o código fonte.
      </div>

      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        [contenteditable] {
          outline: none;
        }

        [contenteditable] p {
          margin: 0.5rem 0;
        }

        [contenteditable] strong {
          font-weight: bold;
        }

        [contenteditable] em {
          font-style: italic;
        }

        [contenteditable] a {
          color: hsl(var(--p));
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
