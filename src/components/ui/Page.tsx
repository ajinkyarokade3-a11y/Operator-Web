import React from 'react';

export const PageContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ style, ...p }) => (
  <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 24, ...style }} {...p} />
);

export const PageHeader: React.FC<{ title: React.ReactNode; description?: React.ReactNode; badge?: React.ReactNode; actions?: React.ReactNode }> = ({ title, description, badge, actions }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
    <div style={{ minWidth: 240 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)' }}>{title}</h1>
        {badge}
      </div>
      {description ? <p style={{ marginTop: 6, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 680 }}>{description}</p> : null}
    </div>
    {actions ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div> : null}
  </div>
);

export const Section: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string; description?: string; actions?: React.ReactNode }> = ({ title, description, actions, children, style, ...p }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }} {...p}>
    {title || description || actions ? (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {title ? <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>{title}</h2> : null}
          {description ? <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{description}</p> : null}
        </div>
        {actions}
      </div>
    ) : null}
    {children}
  </section>
);

export const Grid: React.FC<React.HTMLAttributes<HTMLDivElement> & { cols?: number; gap?: string }> = ({ cols = 2, gap = '16px', style, ...p }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap, ...style } as any} {...p} />
);

export const Stack: React.FC<React.HTMLAttributes<HTMLDivElement> & { gap?: string }> = ({ gap = '12px', style, ...p }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }} {...p} />
);
