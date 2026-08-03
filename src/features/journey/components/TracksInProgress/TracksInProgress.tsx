'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { formatProgressCount, formatProgressPercent } from '@/domain/formation/progress';
import { formatRelative } from '@/shared/utils/datetime';
import type { TrackProgressSummary } from '../../hooks/useJourneyData';

interface TracksInProgressProps {
  tracks: TrackProgressSummary[];
}

/** Acima disso a lista colapsa por categoria e mostra só as mais recentes. */
const INITIAL_VISIBLE = 6;

/**
 * Cursos em andamento.
 *
 * Era um carrossel horizontal sem setas e sem indicador de posição, apoiado na
 * classe `scrollbar-thin` — que não existe no Tailwind v4 nem está definida no
 * projeto. A partir do terceiro card o conteúdo ficava invisível e não descobrível
 * no desktop. Virou grade, com agrupamento por categoria da trilha
 * (`FormationTrack.type`) para não achatar cursos de naturezas diferentes.
 */
export function TracksInProgress({ tracks }: TracksInProgressProps) {
  const [expandido, setExpandido] = useState(false);

  /** Agrupa por categoria, preservando a ordem de recência dentro de cada grupo. */
  const grupos = useMemo(() => {
    const porTipo = new Map<string, TrackProgressSummary[]>();
    for (const t of tracks) {
      // `type` é string sem chave estrangeira garantida — id não resolvido cai em
      // "Outros" em vez de virar um grupo com nome de id.
      const chave = t.track.type?.trim() || '__outros__';
      if (!porTipo.has(chave)) porTipo.set(chave, []);
      porTipo.get(chave)!.push(t);
    }
    return Array.from(porTipo.entries()).map(([tipo, itens]) => ({ tipo, itens }));
  }, [tracks]);

  const visiveis = expandido ? tracks : tracks.slice(0, INITIAL_VISIBLE);
  const agrupar = grupos.length > 1 && expandido;

  if (tracks.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-base sm:text-lg flex items-center gap-1">
          <GraduationCap className="w-5 h-5 text-primary" /> Meus cursos
        </h2>
        <Link href="/app/dashboard/formation" className="link link-hover text-xs">
          Ver todos
        </Link>
      </div>

      {agrupar ? (
        <div className="space-y-4">
          {grupos.map(g => (
            <div key={g.tipo}>
              <h3 className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-2">
                {g.tipo === '__outros__' ? 'Outros' : g.tipo}
              </h3>
              <TrackGrid tracks={g.itens} />
            </div>
          ))}
        </div>
      ) : (
        <TrackGrid tracks={visiveis} />
      )}

      {tracks.length > INITIAL_VISIBLE && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full mt-2"
          onClick={() => setExpandido(v => !v)}
        >
          {expandido
            ? 'Mostrar menos'
            : `Ver todos os ${tracks.length} cursos`}
        </button>
      )}
    </section>
  );
}

function TrackGrid({ tracks }: { tracks: TrackProgressSummary[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
      {tracks.map(t => (
        <Link
          key={t.track.id}
          href={`/app/dashboard/formation/${t.track.id}`}
          className="card bg-base-100 border border-base-300 hover:border-primary transition-colors"
        >
          {t.track.thumbnail_url ? (
            <figure className="aspect-video relative overflow-hidden rounded-t-2xl bg-base-200">
              <Image
                src={t.track.thumbnail_url}
                alt={t.track.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </figure>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center rounded-t-2xl">
              <GraduationCap className="w-10 h-10 text-primary/60" />
            </div>
          )}

          <div className="card-body p-3 gap-1">
            <h3 className="font-semibold text-sm line-clamp-2">{t.track.title}</h3>

            <div className="flex items-center justify-between text-xs text-base-content/60">
              <span>{formatProgressCount(t.progress)}</span>
              <span className="font-semibold text-primary">{formatProgressPercent(t.progress)}</span>
            </div>

            {/* Sem total do currículo não há barra — uma barra cheia mentiria. */}
            <progress
              className="progress progress-primary w-full h-1"
              value={t.progress.percent ?? 0}
              max={100}
            />

            <div className="flex items-center justify-between text-xs mt-1">
              {/* `lastUpdated` era calculado só pra ordenar e nunca exibido. */}
              <span className="text-base-content/40 text-[10px]">
                {t.lastUpdated ? formatRelative(t.lastUpdated) : ''}
              </span>
              <span className="flex items-center text-primary">
                Continuar <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
