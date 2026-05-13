import { AgeRating } from '@/shared/types/content-access';

export type AgeRatingColor = 'success' | 'info' | 'warning' | 'accent' | 'error' | 'neutral';

export interface AgeRatingInfo {
  value: AgeRating;
  minAge: number;
  label: string;
  tooltip: string;
  colorVariant: AgeRatingColor;
}

export const AGE_RATINGS: readonly AgeRatingInfo[] = [
  {
    value: 'L',
    minAge: 0,
    label: 'Livre',
    tooltip: 'Conteúdo apropriado para todas as idades. Sem violência, drogas ou conteúdo sexual.',
    colorVariant: 'success',
  },
  {
    value: '10',
    minAge: 10,
    label: '10 anos',
    tooltip: 'Pode conter violência leve, fantasia ou medo moderado. Sem drogas nem conteúdo sexual.',
    colorVariant: 'info',
  },
  {
    value: '12',
    minAge: 12,
    label: '12 anos',
    tooltip: 'Temas complexos, violência implícita, referências leves a drogas ou insinuações sexuais.',
    colorVariant: 'warning',
  },
  {
    value: '14',
    minAge: 14,
    label: '14 anos',
    tooltip: 'Violência moderada, uso de drogas, conteúdo sexual moderado ou linguagem chula.',
    colorVariant: 'accent',
  },
  {
    value: '16',
    minAge: 16,
    label: '16 anos',
    tooltip: 'Violência intensa, tráfico ou uso pesado de drogas, sexo explícito ocasional, discriminação.',
    colorVariant: 'error',
  },
  {
    value: '18',
    minAge: 18,
    label: '18 anos',
    tooltip: 'Apenas adultos. Violência extrema, sexo explícito, drogas pesadas.',
    colorVariant: 'neutral',
  },
];

const AGE_RATING_MAP = new Map<AgeRating, AgeRatingInfo>(
  AGE_RATINGS.map(r => [r.value, r]),
);

export function getAgeRatingInfo(rating: AgeRating): AgeRatingInfo {
  const info = AGE_RATING_MAP.get(rating);
  if (!info) throw new Error(`Unknown age rating: ${rating}`);
  return info;
}

export function computeAge(birthdate: string, today: Date = new Date()): number {
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return NaN;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function meetsAgeRequirement(birthdate: string | undefined, rating: AgeRating): boolean {
  const info = getAgeRatingInfo(rating);
  if (info.minAge === 0) return true;
  if (!birthdate) return false;
  const age = computeAge(birthdate);
  if (isNaN(age)) return false;
  return age >= info.minAge;
}
