'use client';

import { useEffect, useState } from 'react';
import { Heart, X, Loader2, Plus, Sparkles, Check, Hand } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { prayerService } from '@/application/prayer/PrayerService';
import type { PrayerIntention, PrayerIntentionKind } from '@/domain/prayer/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const KIND_LABELS: Record<PrayerIntentionKind, string> = {
  pessoal: 'Pessoal',
  comunidade: 'Comunidade',
  mundo: 'Mundo',
  agradecimento: 'Agradecimento',
};

export function PrayerCenterModal({ open, onClose }: Props) {
  const user = useCurrentUser();
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<PrayerIntentionKind>('pessoal');
  const [anonymous, setAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prayingId, setPrayingId] = useState<string | null>(null);
  const [prayedSet, setPrayedSet] = useState<Set<string>>(new Set());

  async function reload() {
    setLoading(true);
    try {
      const list = await prayerService.list(30);
      setIntentions(list);
      // Pré-carrega quais já foram orados pelo user
      if (user) {
        const flags = await Promise.all(list.map(i => prayerService.hasUserPrayed(user.id, i.id)));
        const set = new Set<string>();
        list.forEach((i, idx) => { if (flags[idx]) set.add(i.id); });
        setPrayedSet(set);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) reload();
  }, [open, user?.id]);

  async function handleCreate() {
    if (!user || !body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await prayerService.create({ user_id: user.id, body, kind, anonymous });
      setBody('');
      setKind('pessoal');
      setAnonymous(false);
      setComposing(false);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handlePray(id: string) {
    if (!user) return;
    setPrayingId(id);
    try {
      const res = await prayerService.pray(user.id, id);
      setPrayedSet(prev => new Set(prev).add(id));
      if (res.intention) {
        setIntentions(prev => prev.map(i => i.id === id ? res.intention! : i));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPrayingId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base sm:text-lg flex items-center gap-1">
            <Heart className="w-5 h-5 text-error" /> Central de Oração
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1"
              onClick={() => setComposing(c => !c)}
            >
              <Plus className="w-4 h-4" /> Intenção
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error text-sm mb-2"><span>{error}</span></div>}

        {composing && user && (
          <div className="card bg-base-100 border border-primary mb-3">
            <div className="card-body p-3 gap-2">
              <p className="text-xs text-base-content/60">
                Compartilhe uma intenção. A comunidade vai orar com você.
              </p>
              <textarea
                className="textarea textarea-bordered textarea-sm"
                rows={3}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Ex: Pela conversão de minha família..."
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="select select-bordered select-sm"
                  value={kind}
                  onChange={e => setKind(e.target.value as PrayerIntentionKind)}
                >
                  {Object.entries(KIND_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                  />
                  <span className="text-sm">Anônimo</span>
                </label>
              </div>
              <div className="flex justify-end gap-1">
                <button className="btn btn-ghost btn-sm" onClick={() => setComposing(false)}>Cancelar</button>
                <button
                  className="btn btn-primary btn-sm gap-1"
                  onClick={handleCreate}
                  disabled={saving || !body.trim()}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-base-content/60 p-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando intenções...
          </div>
        )}

        {!loading && intentions.length === 0 && (
          <p className="text-sm text-base-content/60 text-center p-4">
            Sem intenções no momento. Seja o primeiro a publicar.
          </p>
        )}

        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
          {intentions.map(it => {
            const prayed = prayedSet.has(it.id);
            return (
              <li key={it.id} className={`card ${it.answered ? 'bg-success/10 border-success' : 'bg-base-100 border-base-300'} border`}>
                <div className="card-body p-3 gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{it.body}</p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="badge badge-ghost badge-xs">{KIND_LABELS[it.kind]}</span>
                        {it.answered && <span className="badge badge-success badge-xs">Respondida</span>}
                        <span className="text-[10px] text-base-content/50">
                          {it.anonymous ? 'Anônimo' : (it.created_by_name ?? 'Membro')} · {formatRelative(it.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm gap-1 ${prayed ? 'btn-success' : 'btn-ghost'}`}
                      disabled={prayingId === it.id || prayed}
                      onClick={() => handlePray(it.id)}
                    >
                      {prayingId === it.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : prayed ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Hand className="w-3.5 h-3.5" />
                      )}
                      {prayed ? 'Orei' : 'Orar'}
                      <span className="badge badge-xs">{it.prayed_count ?? 0}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `${days}d atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
