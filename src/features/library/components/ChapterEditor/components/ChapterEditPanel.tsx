'use client';

import { Save, Eye } from 'lucide-react';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

interface ChapterEditPanelProps {
  order: number;
  markdown: string;
  saving: boolean;
  titleEmpty: boolean;
  onChange: (v: string) => void;
  onPreview: () => void;
  onSave: () => void;
}

export function ChapterEditPanel({
  order, markdown, saving, titleEmpty, onChange, onPreview, onSave,
}: ChapterEditPanelProps) {
  return (
    <div className="card bg-base-100 border border-primary">
      <div className="card-body p-4 gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-base-content/60">
            Linhas em branco separam parágrafos. Use a barra pra formatar (negrito, título, citação, lista).
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-xs" onClick={onPreview}>
              <Eye className="w-3.5 h-3.5" /> Pré-visualizar
            </button>
            <button
              type="button"
              className="btn btn-primary btn-xs gap-1"
              onClick={onSave}
              disabled={saving || titleEmpty}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Salvando...' : 'Salvar e fechar'}
            </button>
          </div>
        </div>

        <RichTextEditor
          value={markdown}
          onChange={onChange}
          height={420}
          placeholder="Comece a escrever o capítulo. # título, > citação, - lista..."
        />

        <p className="text-[10px] text-base-content/50">
          Numeração canônica auto: parágrafos e citações ganham <code>{order}:1</code>, <code>{order}:2</code> etc. Headings e listas não numeram.
        </p>
      </div>
    </div>
  );
}
