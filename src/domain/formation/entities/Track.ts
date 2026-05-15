import { Role } from '@/shared/types/role';
import { FormationTrack, ModuleWithProgress, TrackType } from '@/domain/formation/types';

export const TRACK_TYPE_LABELS: Record<TrackType, string> = {
  'pre-vocacional': 'Pré-vocacional',
  'vocacional': 'Vocacional',
  'etapas': 'As 3 Etapas',
  'continua': 'Formação Contínua',
};

export const TRACK_TYPE_DESCRIPTIONS: Record<TrackType, string> = {
  'pre-vocacional': 'O despertar do sentido — Aberto a interessados',
  'vocacional': 'O discernimento da compaixão — Para quem iniciou a Experiência Carismática',
  'etapas': 'Encarnação, Crucificação, Eucaristia — Para membros em formação específica',
  'continua': 'O alimento diário — Para missionários e consagrados',
};

export class Track {
  static isAccessibleByRole(track: FormationTrack, role: Role): boolean {
    if (role === 'admin') return true;
    if (!role) return false;
    return track.required_roles.length === 0 || track.required_roles.includes(role);
  }

  static typeLabel(type: TrackType): string {
    return TRACK_TYPE_LABELS[type] ?? type;
  }

  static typeDescription(type: TrackType): string {
    return TRACK_TYPE_DESCRIPTIONS[type] ?? '';
  }

  static validate(data: Partial<FormationTrack>): string[] {
    const errors: string[] = [];
    if (!data.title?.trim()) errors.push('Título é obrigatório');
    if (!data.type) errors.push('Tipo é obrigatório');
    return errors;
  }

  /**
   * Aplica `lesson_visibility` da trilha. Admin chama com 'all' (sempre vê tudo).
   *
   * Regras:
   * - 'all': retorna intacto
   * - 'current_only': só a primeira aula não-completed (ou última se todas concluídas)
   * - 'current_and_next': atual + a imediatamente seguinte
   * Módulos vazios após filtro são removidos.
   */
  static filterLessonsForVisibility(
    modules: ModuleWithProgress[],
    visibility?: FormationTrack['lesson_visibility'],
  ): ModuleWithProgress[] {
    if (!visibility || visibility === 'all') return modules;

    // Achata em ordem global (track → módulo → aula)
    const flat: { moduleIdx: number; lessonId: string; completed: boolean }[] = [];
    modules.forEach((m, mi) => {
      m.lessons.forEach(l => {
        flat.push({
          moduleIdx: mi,
          lessonId: l.lesson.id,
          completed: l.progress?.status === 'completed',
        });
      });
    });

    if (flat.length === 0) return modules;

    let currentIdx = flat.findIndex(x => !x.completed);
    if (currentIdx === -1) currentIdx = flat.length - 1; // todas concluídas → última

    const allowed = new Set<string>();
    allowed.add(flat[currentIdx].lessonId);
    if (visibility === 'current_and_next' && currentIdx + 1 < flat.length) {
      allowed.add(flat[currentIdx + 1].lessonId);
    }

    return modules
      .map(m => ({
        ...m,
        lessons: m.lessons.filter(l => allowed.has(l.lesson.id)),
      }))
      .filter(m => m.lessons.length > 0);
  }
}
