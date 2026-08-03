'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, ShieldCheck } from 'lucide-react';
import { BackButton } from '@/shared/components/BackButton';
import { useAccess } from '@/shared/hooks/useAccess';
import { trackEnrollmentService } from '@/application/enrollment/TrackEnrollmentService';
import type { TrackEnrollmentRequest } from '@/domain/enrollment/types';

export default function FormatorApprovalsPage() {
  const { user, isAdmin, isFormatorLike: canApprove } = useAccess();
  const [requests, setRequests] = useState<TrackEnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [noteByReq, setNoteByReq] = useState<Record<string, string>>({});

  async function reload() {
    if (!user) return;
    setLoading(true);
    try {
      const list = await trackEnrollmentService.listPendingForFormator(user.id, isAdmin);
      setRequests(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [user?.id, isAdmin]);

  async function handleDecide(req: TrackEnrollmentRequest, decision: 'approve' | 'reject') {
    if (!user) return;
    setDecidingId(req.id);
    setError(null);
    try {
      const note = noteByReq[req.id];
      if (decision === 'approve') {
        await trackEnrollmentService.approve(req.id, user.id, note);
      } else {
        await trackEnrollmentService.reject(req.id, user.id, note);
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDecidingId(null);
    }
  }

  if (!user) return <div className="p-6">Faça login.</div>;
  if (!canApprove) {
    return (
      <div className="p-6">
        <div className="alert alert-warning"><span>Acesso restrito a formadores.</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/app/dashboard/journey" />
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-accent" /> Aprovações pendentes
          </h1>
        </div>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        {loading && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 items-center text-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-sm text-base-content/60">Carregando solicitações...</p>
            </div>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body p-6 text-center">
              <p className="text-sm text-base-content/60">Nenhuma solicitação pendente.</p>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {requests.map(req => (
            <li key={req.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 sm:p-4 gap-2">
                <div className="flex items-start gap-2 flex-wrap">
                  <Clock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {req.user_name ?? req.user_id} → {req.track_title ?? req.track_id}
                    </p>
                    <p className="text-[11px] text-base-content/60">
                      Solicitado em {formatDate(req.requested_at)}
                    </p>
                    {req.request_note && (
                      <p className="text-xs text-base-content/70 italic mt-1">
                        &ldquo;{req.request_note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <label className="form-control">
                  <span className="label-text text-xs mb-1">Nota da decisão (opcional)</span>
                  <textarea
                    className="textarea textarea-bordered textarea-sm"
                    rows={2}
                    value={noteByReq[req.id] ?? ''}
                    onChange={e => setNoteByReq(prev => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Ex: aprovado após conversa..."
                  />
                </label>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="btn btn-error btn-sm gap-1"
                    disabled={decidingId === req.id}
                    onClick={() => handleDecide(req, 'reject')}
                  >
                    {decidingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Rejeitar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm gap-1"
                    disabled={decidingId === req.id}
                    onClick={() => handleDecide(req, 'approve')}
                  >
                    {decidingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Aprovar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
