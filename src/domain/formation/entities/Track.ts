import { Role } from '@/shared/types/role';
import { FormationTrack, TrackType } from '@/domain/formation/types';

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
}
