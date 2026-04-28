'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { PrayerCenterModal } from '../PrayerCenterModal/PrayerCenterModal';

export function PrayerCenterButton() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const canRead = user.role === 'admin'
    || user.features.includes('read:prayer')
    || user.features.includes('*');
  if (!canRead) return null;

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => setOpen(true)}
        aria-label="Central de Oração"
        title="Central de Oração"
      >
        <Heart className="w-5 h-5 text-error" />
      </button>
      <PrayerCenterModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
