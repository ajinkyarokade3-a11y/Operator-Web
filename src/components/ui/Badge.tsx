import React from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantMap: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
  accent: { background: 'var(--color-accent-soft)', color: 'var(--color-accent)', border: '1px solid var(--color-accent-border)' },
  success: { background: 'var(--color-success-soft)', color: 'var(--color-success)', border: '1px solid var(--color-success-border)' },
  warning: { background: 'var(--color-warning-soft)', color: 'var(--color-warning)', border: '1px solid var(--color-warning-border)' },
  danger: { background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)' },
  info: { background: 'var(--color-info-soft)', color: 'var(--color-info)', border: '1px solid var(--color-info-border)' },
  neutral: { background: 'var(--color-border-subtle)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' },
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', size = 'sm', style, children, ...props }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-full)',
      whiteSpace: 'nowrap',
      fontSize: size === 'sm' ? '10px' : '11px',
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      lineHeight: 1.4,
      ...variantMap[variant],
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

type Status = 'pending' | 'assigned' | 'confirmed' | 'issue' | 'en_route' | 'completed' | 'delayed' | 'cancelled' | 'planning' | 'ongoing';

const statusVariant: Record<string, BadgeVariant> = {
  pending: 'warning',
  planning: 'warning',
  assigned: 'info',
  confirmed: 'success',
  completed: 'success',
  ongoing: 'success',
  issue: 'danger',
  cancelled: 'danger',
  delayed: 'danger',
  en_route: 'accent',
};

export const StatusBadge: React.FC<{ status: string; size?: BadgeSize; style?: React.CSSProperties }> = ({ status, size = 'sm', style }) => {
  const v = statusVariant[status] ?? 'neutral';
  return <Badge variant={v} size={size} style={style}>{status.replace(/_/g, ' ')}</Badge>;
};
