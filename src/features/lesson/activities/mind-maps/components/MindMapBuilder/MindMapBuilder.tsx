'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { MindMapTemplate, MindMapState, MindMapNode } from '@/domain/mind-maps/types';
import { mindMapService } from '@/application/mind-maps/MindMapService';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { RichContent } from '@/shared/components/RichContent';
import { EditableCard, EditableGroup } from '@/shared/components/EditableCard';
import { MindMapCanvas } from '../MindMapCanvas';

interface MindMapBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: MindMapTemplate | null;
  onSaved?: (t: MindMapTemplate) => void;
}

function gid(prefix = 'n') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function buildInitial(initial?: MindMapTemplate | null): { state: MindMapState; title: string; description: string } {
  if (initial) {
    return {
      state: { nodes: initial.nodes, edges: initial.edges, positions: initial.positions },
      title: initial.title,
      description: initial.description ?? '',
    };
  }
  const rootId = gid();
  const rootNode: MindMapNode = { id: rootId, label: 'Conceito central', is_root: true };
  return {
    state: {
      nodes: { [rootId]: rootNode },
      edges: {},
      positions: { [rootId]: { x: 250, y: 200 } },
    },
    title: '',
    description: '',
  };
}

export function MindMapBuilder({ lessonId, createdBy, initial, onSaved }: MindMapBuilderProps) {
  const [init] = useState(() => buildInitial(initial));
  const [title, setTitle] = useState(init.title);
  const [description, setDescription] = useState(init.description);
  const [state, setState] = useState<MindMapState>(init.state);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSavedMsg(null);
    setSaving(true);
    try {
      const payload: MindMapTemplate | (Omit<MindMapTemplate, 'id'> & { id?: string }) = {
        id: initial?.id,
        lesson_id: lessonId,
        title: title.trim(),
        description: description.trim() || undefined,
        nodes: state.nodes,
        edges: state.edges,
        positions: state.positions,
        created_at: initial?.created_at ?? new Date().toISOString(),
        created_by: initial?.created_by ?? createdBy,
      };
      const saved = await mindMapService.saveTemplate(payload as MindMapTemplate);
      setSavedMsg('Template salvo com sucesso.');
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditableGroup>
    <div className="space-y-4">
      <EditableCard
        badge={
          <>
            <span className="badge badge-secondary badge-sm">Mapa mental</span>
            {title.trim() && <span className="font-semibold text-sm truncate">{title}</span>}
          </>
        }
        preview={
          <div className="space-y-1">
            {!title.trim() && (
              <p className="text-sm italic text-base-content/40">(sem título — clique no lápis)</p>
            )}
            {description.trim() ? (
              <RichContent markdown={description} className="text-sm" />
            ) : (
              <p className="text-xs italic text-base-content/40">(sem descrição)</p>
            )}
          </div>
        }
        editor={
          <div className="space-y-3">
            <div>
              <span className="label-text text-xs mb-1 block">Título</span>
              <input
                className="input input-bordered input-sm w-full"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex.: Mapa da Teologia da Graça"
              />
            </div>
            <div>
              <span className="label-text text-xs mb-1 block">Descrição (Markdown)</span>
              <MarkdownField value={description} onChange={setDescription} height={120} preview="edit" />
            </div>
          </div>
        }
      />

      <MindMapCanvas state={state} onChange={setState} allowRootToggle />

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      {savedMsg && <div className="alert alert-success text-sm"><span>{savedMsg}</span></div>}

      <div className="flex justify-end">
        <button className="btn btn-primary gap-1" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar template'}
        </button>
      </div>
    </div>
    </EditableGroup>
  );
}
