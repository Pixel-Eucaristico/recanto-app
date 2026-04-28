'use client';

import { useEffect, useState } from 'react';

export function usePageSize(): number {
  const [size, setSize] = useState(31);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setSize(7);
      else if (w < 1024) setSize(14);
      else setSize(31);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
