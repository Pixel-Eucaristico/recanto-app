'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Tooltip } from '@/shared/components/Tooltip';

const SHOW_THRESHOLD_PX = 400;

/** Encontra ancestor com overflow-y scroll (DashboardLayout main). Fallback window. */
function findScrollContainer(): HTMLElement | Window {
  if (typeof document === 'undefined') return window;
  const main = document.querySelector('main');
  if (main) {
    const style = getComputedStyle(main);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') return main;
  }
  return window;
}

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = findScrollContainer();
    const isWindow = container === window;

    function getScrollTop(): number {
      return isWindow ? window.scrollY : (container as HTMLElement).scrollTop;
    }
    function onScroll() {
      setVisible(getScrollTop() > SHOW_THRESHOLD_PX);
    }
    onScroll();
    const target = isWindow ? window : (container as HTMLElement);
    target.addEventListener('scroll', onScroll as EventListener, { passive: true });
    return () => target.removeEventListener('scroll', onScroll as EventListener);
  }, []);

  function handleClick() {
    const container = findScrollContainer();
    if (container === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (!visible) return null;

  return (
    <Tooltip tip="Voltar ao topo" position="left">
      <button
        type="button"
        onClick={handleClick}
        className="btn btn-primary btn-circle btn-md shadow-lg fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40"
        aria-label="Voltar ao topo"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </Tooltip>
  );
}
