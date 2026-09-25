import React from 'react';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => {
  const [hovered, setHovered] = React.useState<string | null>(null);
  return (
  <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', overflowX: 'auto' as const }} className="no-scrollbar">
    {tabs.map((t) => {
      const isActive = t.id === active;
      const isHovered = hovered === t.id && !isActive;
      return (
        <button
          key={t.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(t.id)}
          onMouseEnter={() => setHovered(t.id)}
          onMouseLeave={() => setHovered((h) => (h === t.id ? null : h))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            border: 'none',
            borderBottom: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            background: isActive ? 'var(--color-surface-elevated)' : isHovered ? 'var(--color-surface)' : 'transparent',
            boxShadow: isActive ? 'var(--highlight-top-subtle)' : 'none',
            color: isActive ? 'var(--color-text-primary)' : isHovered ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            marginBottom: -1,
            transition: 'all var(--transition-fast)',
          }}
        >
          {t.icon ? <span style={{ display: 'inline-flex', color: isActive ? 'var(--color-accent)' : isHovered ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>{t.icon}</span> : null}
          {t.label}
        </button>
      );
    })}
  </div>
  );
};
