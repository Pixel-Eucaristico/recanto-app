'use client';

import Link from 'next/link';
import { Lock, AlertTriangle, UserCog } from 'lucide-react';
import { AccessDecision, AgeRating } from '@/shared/types/content-access';
import { AgeRatingBadge } from '@/shared/components/AgeRatingBadge';
import { AGE_RATINGS } from '@/shared/content-access/ageRating';

interface AccessBlockedModalProps {
  open: boolean;
  decision: AccessDecision;
  /** Título do conteúdo (livro/curso) sendo bloqueado — opcional. */
  contentTitle?: string;
  onClose: () => void;
}

function ratingForMinAge(minAge?: number): AgeRating {
  if (!minAge) return 'L';
  const found = [...AGE_RATINGS].reverse().find(r => r.minAge <= minAge && r.value !== 'L');
  return (found?.value ?? 'L') as AgeRating;
}

export function AccessBlockedModal({
  open,
  decision,
  contentTitle,
  onClose,
}: AccessBlockedModalProps) {
  if (!open) return null;

  const titleSuffix = contentTitle ? ` "${contentTitle}"` : '';
  const rating = ratingForMinAge(decision.minAge);

  let icon = <Lock className="w-12 h-12 text-warning" />;
  let title = 'Acesso restrito';
  let body: React.ReactNode = null;
  let primaryAction: React.ReactNode = null;

  switch (decision.reason) {
    case 'age':
      icon = <AlertTriangle className="w-12 h-12 text-warning" />;
      title = 'Conteúdo classificado por idade';
      body = (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <AgeRatingBadge rating={rating} size="lg" showTooltip />
          </div>
          <p>
            Este conteúdo{titleSuffix} é classificado para <strong>{decision.minAge} anos</strong>.
            Você foi cadastrado com idade abaixo da exigida.
          </p>
          <p className="text-base-content/70 text-sm">
            Se acredita que isso é um erro, fale com seu formador ou ajuste a data de nascimento no perfil.
          </p>
        </div>
      );
      primaryAction = (
        <Link href="/app/dashboard/profile" className="btn btn-primary btn-sm">
          <UserCog className="w-4 h-4" /> Revisar perfil
        </Link>
      );
      break;

    case 'role':
      title = 'Conteúdo restrito ao grupo';
      body = (
        <p>
          Este conteúdo{titleSuffix} é restrito a grupos específicos. Solicite acesso ao seu formador.
        </p>
      );
      break;

    case 'no_birthdate':
      icon = <UserCog className="w-12 h-12 text-info" />;
      title = 'Complete seu perfil';
      body = (
        <p>
          Pra acessar este conteúdo{titleSuffix} (classificado para <strong>{decision.minAge ?? '+'} anos</strong>),
          informe sua data de nascimento no perfil.
        </p>
      );
      primaryAction = (
        <Link href="/app/dashboard/profile" className="btn btn-primary btn-sm">
          <UserCog className="w-4 h-4" /> Completar perfil
        </Link>
      );
      break;

    case 'not_authenticated':
      title = 'Faça login';
      body = <p>Você precisa estar logado pra acessar este conteúdo.</p>;
      primaryAction = (
        <Link href="/app/login" className="btn btn-primary btn-sm">
          Entrar
        </Link>
      );
      break;

    default:
      body = <p>Acesso não permitido.</p>;
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center gap-4 text-center">
          {icon}
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="text-base-content/90">{body}</div>
        </div>
        <div className="modal-action justify-center gap-2">
          {primaryAction}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
