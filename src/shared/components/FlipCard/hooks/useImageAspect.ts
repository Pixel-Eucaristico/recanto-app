'use client';

import { useEffect, useState } from 'react';

export function useImageAspect(url?: string): number | null {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    setRatio(null);
    if (!url) return;
    const img = new Image();
    img.onload = () => setRatio(img.naturalWidth / img.naturalHeight);
    img.src = url;
  }, [url]);

  return ratio;
}
