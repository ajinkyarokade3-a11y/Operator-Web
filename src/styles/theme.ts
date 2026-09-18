/**
 * WanderAI Operator — Design Tokens (JS)
 * Mirrors src/styles/tokens.css for programmatic access.
 * Change one token → entire website updates (via CSS variables).
 */

export const THEME = {
  colors: {
    background: 'var(--color-background)',
    backgroundSecondary: 'var(--color-background-secondary)',
    backgroundTertiary: 'var(--color-background-tertiary)',
    surface: 'var(--color-surface)',
    surfaceElevated: 'var(--color-surface-elevated)',
    surfaceHover: 'var(--color-surface-hover)',
    surfaceOverlay: 'var(--color-surface-overlay)',

    border: 'var(--color-border)',
    borderStrong: 'var(--color-border-strong)',
    borderSubtle: 'var(--color-border-subtle)',
    borderFocus: 'var(--color-border-focus)',

    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    textFaint: 'var(--color-text-faint)',

    accent: 'var(--color-accent)',
    accentHover: 'var(--color-accent-hover)',
    accentSoft: 'var(--color-accent-soft)',
    accentSecondary: 'var(--color-accent-secondary)',
    accentSecondarySoft: 'var(--color-accent-secondary-soft)',

    success: 'var(--color-success)',
    successSoft: 'var(--color-success-soft)',
    warning: 'var(--color-warning)',
    warningSoft: 'var(--color-warning-soft)',
    danger: 'var(--color-danger)',
    dangerSoft: 'var(--color-danger-soft)',
    info: 'var(--color-info)',
  },

  typography: {
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },
    headings: {
      h1: { size: 'var(--text-2xl)', weight: 'var(--weight-bold)', tracking: 'var(--tracking-tight)', family: 'var(--font-display)' },
      h2: { size: 'var(--text-xl)', weight: 'var(--weight-bold)', tracking: 'var(--tracking-tight)', family: 'var(--font-display)' },
      h3: { size: 'var(--text-lg)', weight: 'var(--weight-semibold)', family: 'var(--font-display)' },
    },
    body: { size: 'var(--text-base)', leading: 'var(--leading-normal)', family: 'var(--font-body)' },
    labels: { size: 'var(--text-sm)', weight: 'var(--weight-semibold)', tracking: 'var(--tracking-wide)' },
    captions: { size: 'var(--text-xs)', weight: 'var(--weight-medium)', tracking: 'var(--tracking-wide)' },
  },

  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    xxl: 'var(--space-2xl)',
    xxxl: 'var(--space-3xl)',
  },

  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },

  shadows: {
    subtle: 'var(--shadow-subtle)',
    elevated: 'var(--shadow-elevated)',
    modal: 'var(--shadow-modal)',
    glow: 'var(--shadow-glow-accent)',
  },

  transitions: {
    fast: 'var(--transition-fast)',
    normal: 'var(--transition-normal)',
    slow: 'var(--transition-slow)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  dimensions: {
    headerHeight: 'var(--header-height)',
    sidebarWidth: 'var(--sidebar-width)',
    contentMaxWidth: 'var(--content-max-width)',
    cardPadding: 'var(--card-padding)',
  },
} as const;

export type Theme = typeof THEME;
