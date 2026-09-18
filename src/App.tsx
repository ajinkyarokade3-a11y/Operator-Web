import { OperatorPortal } from './pages/OperatorPortal';
import { useEffect } from 'react';

function useGlobalShine() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const box = target.closest('.surface, [style*="var(--color-surface)"], .specular-box, div[class*="rounded-xl"], div[class*="rounded-2xl"]') as HTMLElement | null;
      if (box) {
        const rect = box.getBoundingClientRect();
        box.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        box.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        box.classList.add('specular-box');
      }
      const btn = target.closest('button:not(.specular-button), [role="button"]') as HTMLElement | null;
      if (btn) {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        btn.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
      }
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);
}

export default function App() {
  useGlobalShine();
  return <OperatorPortal onSwitchToTraveler={() => undefined} />;
}
