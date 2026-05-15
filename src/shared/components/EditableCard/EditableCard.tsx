'use client';

import { createContext, useContext, useId, useState, ReactNode } from 'react';
import { Pencil, Check, Trash2, GripVertical } from 'lucide-react';

// ─── Group context — apenas um editor aberto por vez ───────────────────────

interface EditableGroupContextValue {
  openId: string | null;
  requestOpen: (id: string) => void;
  requestClose: (id: string) => void;
}

const EditableGroupContext = createContext<EditableGroupContextValue | null>(null);

interface EditableGroupProps {
  children: ReactNode;
}

/**
 * Garante que só um EditableCard fica em modo edição por vez dentro do grupo.
 * Ao clicar no lápis de outro card, o anterior fecha automaticamente
 * (state já está salvo via onChange contínuo dos editores internos).
 */
export function EditableGroup({ children }: EditableGroupProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <EditableGroupContext.Provider
      value={{
        openId,
        requestOpen: id => setOpenId(id),
        requestClose: id => setOpenId(prev => (prev === id ? null : prev)),
      }}
    >
      {children}
    </EditableGroupContext.Provider>
  );
}

// ─── EditableCard ──────────────────────────────────────────────────────────

interface EditableCardProps {
  badge?: ReactNode;
  preview: ReactNode;
  editor: ReactNode;
  onRemove?: () => void;
  canRemove?: boolean;
  defaultEditing?: boolean;
  dragHandle?: boolean;
}

export function EditableCard({
  badge, preview, editor, onRemove, canRemove = true, defaultEditing = false, dragHandle = false,
}: EditableCardProps) {
  const localId = useId();
  const group = useContext(EditableGroupContext);

  // Group context controla; senão usa estado local
  const [localEditing, setLocalEditing] = useState(defaultEditing);
  const editing = group ? group.openId === localId : localEditing;

  function setEditing(next: boolean) {
    if (group) {
      if (next) group.requestOpen(localId);
      else group.requestClose(localId);
    } else {
      setLocalEditing(next);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 gap-3">
        <div className="flex items-start gap-2 flex-wrap">
          {dragHandle && (
            <GripVertical className="w-5 h-5 text-base-content/30 mt-1 shrink-0 hidden sm:block" />
          )}
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            {badge}
          </div>
          <div className="flex gap-1 shrink-0">
            {editing ? (
              <button
                type="button"
                className="btn btn-primary btn-xs gap-1"
                onClick={() => setEditing(false)}
              >
                <Check className="w-3.5 h-3.5" /> Salvar
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setEditing(true)}
                title="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={onRemove}
                disabled={!canRemove}
                title="Remover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          {editing ? editor : preview}
        </div>

        {editing && (
          <div className="flex justify-end pt-2 border-t border-base-300">
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1"
              onClick={() => setEditing(false)}
            >
              <Check className="w-4 h-4" /> Salvar e fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
