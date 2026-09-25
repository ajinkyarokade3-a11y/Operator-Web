import React from 'react';

export const Modal: React.FC<{ open: boolean; onClose: () => void; title?: string; width?: string; children: React.ReactNode }> = ({ open, onClose, title, width = '520px', children }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }} />
      <div ref={panelRef} tabIndex={-1} style={{ position: 'relative', width: '100%', maxWidth: width, maxHeight: '85vh', overflowY: 'auto', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-overlay)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, outline: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {title ? <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h3> : <span />}
          <button onClick={onClose} aria-label="Close dialog" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
