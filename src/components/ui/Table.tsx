import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLDivElement> & { bleed?: boolean }> = ({ children, style, bleed, ...p }) => (
  <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', ...style }} {...p}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>{children}</table>
  </div>
);
export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (p) => (
  <thead style={{ background: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border)' } as any} {...p} />
);
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (p) => <tbody {...p} />;
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }> = ({ hover = true, style, ...p }) => (
  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background var(--transition-fast)', ...style }} onMouseEnter={(e) => { if (hover) (e.currentTarget as any).style.background = 'var(--color-surface-hover)'; }} onMouseLeave={(e) => { (e.currentTarget as any).style.background = 'transparent'; }} {...p} />
);
export const TableHeadCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ style, ...p }) => (
  <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', ...style }} {...p} />
);
export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ style, ...p }) => (
  <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', verticalAlign: 'middle', ...style }} {...p} />
);
