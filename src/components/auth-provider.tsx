'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useSetAtom } from 'jotai';
import { auth } from '@/lib/firebase';
import { userAtom, loadingAtom } from '@/lib/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(loadingAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}