import React from 'react';

type Variant = 'default' | 'elevated' | 'outlined' | 'interactive' | 'sunken' | 'overlay';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  // Quiet base — sits close to the page, minimal lift.
  default: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: 'var(--shadow-subtle)',
  },
  // Lifted panel — one rung lighter with a standard soft shadow.
  elevated: {
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-standard)',
  },
  // Ghost — merges with whatever is behind it, border only.
  outlined: {
    background: 'transparent',
    border: '1px solid var(--color-border-strong)',
    boxShadow: 'none',
  },
  // Interactive — rests at base, lifts on hover.
  interactive: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-subtle)',
    cursor: 'pointer',
  },
  // Carved well — darker than the page, inset rather than raised.
  sunken: {
    background: 'var(--color-surface-sunken)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: 'var(--shadow-inset)',
  },
  // Important floating panel — brightest rung with the deepest soft shadow.
  overlay: {
    background: 'var(--color-surface-overlay)',
    border: '1px solid var(--color-border-strong)',
    boxShadow: 'var(--shadow-overlay)',
  },
};

const paddingMap: Record<string, string> = {
  none: '0',
  sm: '12px',
  md: 'var(--card-padding)',
  lg: '24px',
};

export const Card: React.FC<CardProps> = ({ variant = 'default', padding = 'md', interactive, children, style, onMouseEnter, onMouseLeave, role, tabIndex, ...props }) => {
  const [hovered, setHovered] = React.useState(false);
  const [isShine, setIsShine] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };
  const base: React.CSSProperties = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 'var(--radius-lg)',
    padding: paddingMap[padding],
    transition: 'background var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal)',
    ...variantStyles[interactive ? 'interactive' : variant],
    ...(interactive && hovered ? { background: 'var(--color-surface-interactive)', borderColor: 'var(--color-border-strong)', boxShadow: 'var(--shadow-standard)' } : {}),
    ...style,
  };
  const a11y = interactive ? { role: (role as any) || 'button', tabIndex: tabIndex ?? 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.target as HTMLElement).click(); } } } : {};
  return (
    <div
      ref={ref as any}
      style={base}
      onMouseEnter={(e) => { setHovered(true); setIsShine(true); onMouseEnter?.(e as any); }}
      onMouseLeave={(e) => { setHovered(false); setIsShine(false); onMouseLeave?.(e as any); }}
      onMouseMove={handleMove}
      {...a11y}
      {...props}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          opacity: isShine ? 1 : 0,
          padding: 1,
          background: `radial-gradient(220px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.28), rgba(255,255,255,0.12) 32%, transparent 62%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          transition: 'opacity 280ms ease',
          zIndex: 0,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'block' }}>{children}</span>
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ style, ...p }) => (
  <div style={{ padding: 'var(--card-padding) var(--card-padding) 0', ...style }} {...p} />
);
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ style, ...p }) => (
  <div style={{ padding: 'var(--card-padding)', ...style }} {...p} />
);
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ style, ...p }) => (
  <div style={{ padding: '0 var(--card-padding) var(--card-padding)', ...style }} {...p} />
);
