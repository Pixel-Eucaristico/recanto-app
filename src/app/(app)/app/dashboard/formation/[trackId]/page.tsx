'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useFormationTrack } from '@/features/formation/hooks/useFormationTrack';
import { ModuleAccordion } from '@/features/formation/components/ModuleAccordion';
import { Track } from '@/domain/formation/entities/Track';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { trackEnrollmentService } from '@/application/enrollment/TrackEnrollmentService';
import type { TrackEnrollmentRequest } from '@/domain/enrollment/types';

interface Props {
  params: Promise<{ trackId: string }>;
}

export default function TrackPage({ params }: Props) {
  const { trackId } = use(params);
  const { data, loading, error } = useFormationTrack(trackId);
  const user = useCurrentUser();
  const isAdminLike = user?.role === 'admin'
    || user?.features.includes('manage:formation')
    || user?.features.includes('*')
    || (user?.id ? data?.track.formator_ids?.includes(user.id) : false)
    || false;

  const [enrollment, setEnrollment] = useState<TrackEnrollmentRequest | null>(null);
  const [prerequisitesMet, setPrerequisitesMet] = useState<boolean>(true);
  const [requesting, setRequesting] = useState(false);
  const [requestNote, setRequestNote] = useState('');

  useEffect(() => {
    if (!user?.id || !data?.track) return;
    if (isAdminLike) return;
    Promise.all([
      trackEnrollmentService.getRequestStatus(user.id, data.track.id),
      trackEnrollmentService.hasPrerequisitesMet(user.id, data.track),
    ]).then(([req, met]) => {
      setEnrollment(req);
      setPrerequisitesMet(met);
    });
  }, [user?.id, data?.track?.id, isAdminLike]);

  async function handleRequest() {
    if (!user?.id || !data?.track) return;
    setRequesting(true);
    try {
      const req = await trackEnrollmentService.request(user.id, data.track.id, requestNote || undefined);
      setEnrollment(req);
    } finally {
      setRequesting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-base-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{error ?? 'Trilha não encontrada.'}</span>
        </div>
      </div>
    );
  }

  const { track, modules: rawModules, completedLessons, totalLessons } = data;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  // Admin/formador da trilha sempre vê tudo. Aluno respeita lesson_visibility.
  const modules = isAdminLike
    ? rawModules
    : Track.filterLessonsForVisibility(rawModules, track.lesson_visibility);

  // Gate de aprovação manual
  const needsApproval = !isAdminLike && Boolean(track.requires_formator_approval);
  const isApproved = enrollment?.status === 'approved';
  const isPending = enrollment?.status === 'pending';
  const isRejected = enrollment?.status === 'rejected';
  const blockedByApproval = needsApproval && !isApproved;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-base-content/50">
        <Link href="/app/dashboard/formation" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Trilhas
        </Link>
        <span>/</span>
        <span className="text-base-content">{track.title}</span>
      </div>

      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <GraduationCap className="w-7 h-7 text-primary flex-shrink-0" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-base-content">{track.title}</h1>
              <span className="badge badge-outline">{Track.typeLabel(track.type)}</span>
            </div>
            <p className="text-base-content/60 text-sm mt-1">{track.description}</p>
          </div>
        </div>

        {totalLessons > 0 && (
          <div className="space-y-1 max-w-md">
            <div className="flex justify-between text-xs text-base-content/60">
              <span>{completedLessons} de {totalLessons} aulas concluídas</span>
              <span>{progressPercent}%</span>
            </div>
            <progress className="progress progress-primary w-full" value={progressPercent} max={100} />
          </div>
        )}
      </header>

      {blockedByApproval && (
        <div className="card bg-base-100 border border-warning">
          <div className="card-body p-4 sm:p-6 gap-3">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="font-semibold">Trilha com aprovação manual</h2>
                <p className="text-sm text-base-content/70 mt-1">
                  {!prerequisitesMet
                    ? 'Conclua as trilhas pré-requisito antes de solicitar acesso.'
                    : isPending
                      ? 'Sua solicitação está aguardando aprovação do formador.'
                      : isRejected
                        ? 'Sua última solicitação foi recusada. Entre em contato com o formador antes de solicitar novamente.'
                        : 'Solicite acesso ao formador pra começar.'}
                </p>
                {enrollment?.decision_note && (
                  <p className="text-xs text-base-content/60 mt-1 italic">
                    Nota do formador: {enrollment.decision_note}
                  </p>
                )}
              </div>
            </div>

            {prerequisitesMet && !isPending && (
              <div className="space-y-2">
                <label className="form-control">
                  <span className="label-text text-xs mb-1">Mensagem para o formador (opcional)</span>
                  <textarea
                    className="textarea textarea-bordered textarea-sm"
                    rows={2}
                    value={requestNote}
                    onChange={e => setRequestNote(e.target.value)}
                    placeholder="Ex: gostaria de iniciar essa trilha porque..."
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-primary btn-sm gap-1 self-start"
                  onClick={handleRequest}
                  disabled={requesting}
                >
                  {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isRejected ? 'Solicitar novamente' : 'Solicitar acesso'}
                </button>
              </div>
            )}

            {isPending && (
              <div className="alert alert-info text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Solicitação pendente — você será notificado quando aprovado.</span>
              </div>
            )}

            {isRejected && (
              <div className="alert alert-error text-sm gap-2">
                <XCircle className="w-4 h-4" />
                <span>Última decisão: rejeitada.</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`space-y-3 ${blockedByApproval ? 'opacity-40 pointer-events-none' : ''}`}>
        {modules.map((mp, idx) => (
          <ModuleAccordion
            key={mp.module.id}
            moduleWithProgress={mp}
            trackId={trackId}
            defaultOpen={idx === 0}
          />
        ))}

        {modules.length === 0 && (
          <div className="text-center py-16 text-base-content/40">
            <p>Nenhum módulo disponível nesta trilha.</p>
          </div>
        )}
      </div>
    </div>
  );
}
