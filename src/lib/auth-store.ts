import { atom } from 'jotai';
import { User } from 'firebase/auth';

export const userAtom = atom<User | null>(null);
export const loadingAtom = atom<boolean>(true);
export const isAuthenticatedAtom = atom<boolean>((get) => get(userAtom) !== null);