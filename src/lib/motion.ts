import { useEffect, useRef, useState } from 'react';

export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const DUR = { fast: 180, normal: 420, slow: 750, hero: 1100 } as const;

export function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible } as const;
}
