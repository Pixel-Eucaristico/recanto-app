import { atomWithStorage } from 'jotai/utils'
import { ThemeType } from './theme.types';

export const dualThemeAtom = atomWithStorage<ThemeType>('theme-preference', 'system');
