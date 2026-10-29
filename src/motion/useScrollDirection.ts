'use client';

import { useEffect, useState } from 'react';

const SCROLLED_AFTER = 8;
const HIDE_AFTER = 240;
const THRESHOLD = 6;

/** `scrolled`: rolou mais de 8px. `hidden`: descendo e já passou de 240px (volta ao subir). rAF + limiar de 6px. */
export function useScrollDirection(disabled = false) {
  const [state, setState] = useState({ scrolled: false, hidden: false });

  useEffect(() => {
    if (disabled) return;
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      const moved = Math.abs(delta) > THRESHOLD;
      /* calculado fora do updater do setState: `last` já terá mudado quando ele rodar */
      const nextHidden = moved ? delta > 0 && y > HIDE_AFTER : undefined;
      if (moved) last = y;
      ticking = false;

      setState((prev) => {
        const scrolled = y > SCROLLED_AFTER;
        const hidden = nextHidden ?? prev.hidden;
        return scrolled === prev.scrolled && hidden === prev.hidden ? prev : { scrolled, hidden };
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [disabled]);

  return state;
}
