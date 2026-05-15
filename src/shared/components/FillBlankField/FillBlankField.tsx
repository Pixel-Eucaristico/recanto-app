'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { SquareDashedBottomCode } from 'lucide-react';
import { commands as mdCommands, type ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface FillBlankFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

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

type Api = { replaceSelection: (text: string) => void };

export function FillBlankField({ value, onChange, placeholder, height = 180, disabled }: FillBlankFieldProps) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptWord, setPromptWord] = useState('');
  const apiRef = useRef<Api | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const update = () => {
      const mode = detectColorMode();
      setColorMode(mode);
      document.documentElement.setAttribute('data-color-mode', mode);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const LABELS: Record<string, string> = {
    bold: 'Negrito',
    italic: 'Itálico',
    strikethrough: 'Riscado',
    hr: 'Linha horizontal',
    title: 'Título',
    title1: 'Título 1',
    title2: 'Título 2',
    title3: 'Título 3',
    title4: 'Título 4',
    title5: 'Título 5',
    title6: 'Título 6',
    link: 'Link',
    quote: 'Citação',
    code: 'Código inline',
    codeBlock: 'Bloco de código',
    comment: 'Comentário',
    image: 'Imagem (URL)',
    unordered: 'Lista',
    'unordered-list': 'Lista',
    ordered: 'Lista numerada',
    'ordered-list': 'Lista numerada',
    checked: 'Checklist',
    'checked-list': 'Checklist',
    edit: 'Editar',
    live: 'Editor + preview',
    preview: 'Preview',
    fullscreen: 'Tela cheia',
    help: 'Ajuda',
  };

  const commandsFilter = (cmd: ICommand): false | ICommand => {
    if (!cmd) return cmd;
    const name = cmd.name;
    const label = name ? LABELS[name] : undefined;
    if (!label) return cmd;
    return { ...cmd, buttonProps: { ...(cmd.buttonProps ?? {}), 'aria-label': label, title: label } };
  };

  const blankCommand: ICommand = {
    name: 'fill-blank',
    keyCommand: 'fill-blank',
    buttonProps: { 'aria-label': 'Inserir lacuna', title: 'Inserir lacuna' },
    icon: <SquareDashedBottomCode style={{ width: 14, height: 14 }} />,
    execute: (state, api) => {
      apiRef.current = api;
      const selected = state?.selectedText?.trim() ?? '';
      if (selected.length > 0) {
        api.replaceSelection(`{{${selected}}}`);
        return;
      }
      setPromptWord('');
      setPromptOpen(true);
    },
  };

  const toolbarCommands: ICommand[] = [
    mdCommands.bold,
    mdCommands.italic,
    mdCommands.strikethrough,
    mdCommands.hr,
    mdCommands.divider,
    mdCommands.title,
    mdCommands.divider,
    mdCommands.link,
    mdCommands.quote,
    blankCommand,
    mdCommands.code,
    mdCommands.codeBlock,
    mdCommands.divider,
    mdCommands.unorderedListCommand,
    mdCommands.orderedListCommand,
    mdCommands.checkedListCommand,
  ];

  function confirmPrompt() {
    const word = promptWord.trim();
    if (!word) return;
    apiRef.current?.replaceSelection(`{{${word}}}`);
    setPromptOpen(false);
    setPromptWord('');
  }

  return (
    <div
      className="markdown-field wmde-markdown-var rounded-lg overflow-hidden border border-base-300"
      data-color-mode={colorMode}
    >
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={height}
        preview="edit"
        commands={toolbarCommands}
        commandsFilter={commandsFilter}
        textareaProps={{ placeholder, disabled }}
      />

      {promptOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Inserir lacuna</h3>
            <p className="text-xs text-base-content/60 mb-3">
              Palavra que o aluno deve preencher. Para aceitar sinônimos separe por vírgula
              (ex.: <code className="bg-base-200 px-1 rounded">caridade, amor</code>).
            </p>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={promptWord}
              onChange={e => setPromptWord(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmPrompt(); } }}
              placeholder="ex.: caridade, amor"
              autoFocus
            />
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setPromptOpen(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={confirmPrompt} disabled={!promptWord.trim()}>
                Inserir
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPromptOpen(false)} />
        </div>
      )}
    </div>
  );
}
