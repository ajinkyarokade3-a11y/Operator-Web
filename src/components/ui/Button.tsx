import React from 'react';
import SpecularButton from './SpecularButton';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: 'var(--color-text-inverse)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-subtle)',
  },
  secondary: {
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-strong)',
    boxShadow: 'var(--shadow-subtle)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#FFFFFF',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-subtle)',
  },
  success: {
    background: 'var(--color-success)',
    color: '#FFFFFF',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-subtle)',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: 'var(--input-height-sm)', padding: '0 12px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)', gap: 6 },
  md: { height: 'var(--input-height)', padding: '0 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)', gap: 8 },
  lg: { height: '44px', padding: '0 20px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-md)', gap: 8 },
  icon: { width: 'var(--tap-target)', height: 'var(--tap-target)', padding: 0, borderRadius: 'var(--radius-md)', gap: 0 },
};

const variantSpecular: Record<Variant, { baseColor: string; lineColor: string; textColor: string }> = {
  primary: { baseColor: '#3A3A3A', lineColor: '#ffffff', textColor: '#ffffff' },
  secondary: { baseColor: '#3A3A3A', lineColor: '#ffffff', textColor: '#ffffff' },
  ghost: { baseColor: '#3A3A3A', lineColor: '#ffffff', textColor: '#ffffff' },
  danger: { baseColor: '#3A3A3A', lineColor: '#ffffff', textColor: '#ffffff' },
  success: { baseColor: '#3A3A3A', lineColor: '#ffffff', textColor: '#ffffff' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, leftIcon, rightIcon, children, disabled, type = 'button', style, className, ...props }, ref) => {
    const isDisabled = disabled || loading;
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const spec = variantSpecular[variant];
    // Use specular for all variants — adapts to existing token palette, no orange/red
    const useSpecular = !isDisabled;
    if (useSpecular) {
      return (
        <SpecularButton
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'icon' ? 'md' : 'md'}
          radius={6}
          baseColor={spec.baseColor}
          lineColor={spec.lineColor}
          textColor={spec.textColor}
          intensity={1.6}
          thickness={1.6}
          speed={0.45}
          followMouse
          proximity={280}
          shineSize={14}
          shineFade={30}
          disabled={isDisabled}
          onClick={props.onClick as any}
          className={className}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? 6 : 8, fontSize: size === 'sm' ? 'var(--text-xs)' : size === 'lg' ? 'var(--text-base)' : 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            {loading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> : leftIcon ? <span style={{ display: 'inline-flex' }}>{leftIcon}</span> : null}
            {children && size !== 'icon' ? <span>{children}</span> : null}
            {!loading && rightIcon ? <span style={{ display: 'inline-flex' }}>{rightIcon}</span> : null}
          </span>
        </SpecularButton>
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        onMouseEnter={() => { if (!isDisabled) setHovered(true); }}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => { if (!isDisabled) setPressed(true); }}
        onMouseUp={() => setPressed(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? Number.parseFloat('var(--opacity-disabled)') || 0.45 : 1,
          transition: 'background var(--transition-normal), border-color var(--transition-normal), opacity var(--transition-fast), box-shadow var(--transition-normal), transform var(--transition-fast), filter var(--transition-fast)',
          whiteSpace: 'nowrap',
          ...variantStyles[variant],
          ...sizeStyles[size],
          // Interactive depth: rest on subtle elevation, lift slightly on
          // hover, press into an inset state when active, go flat when disabled.
          ...(isDisabled
            ? { boxShadow: 'none' as const }
            : pressed
              ? { boxShadow: 'var(--shadow-inset)', filter: 'brightness(0.94)' }
              : hovered
                ? {
                    boxShadow: 'var(--shadow-standard)',
                    filter: 'brightness(1.07)',
                    ...(variant === 'ghost' ? { background: 'var(--color-surface-elevated)' } : {}),
                  }
                : {}),
          ...style,
        }}
        className={['ui-btn', className].filter(Boolean).join(' ') || undefined}
        {...props}
      >
        {loading ? (
          <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
        ) : leftIcon ? (
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{leftIcon}</span>
        ) : null}
        {children && size !== 'icon' ? <span>{children}</span> : null}
        {!loading && rightIcon ? <span style={{ display: 'inline-flex', flexShrink: 0 }}>{rightIcon}</span> : null}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </button>
    );
  },
);
Button.displayName = 'Button';

export const IconButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'size'> & { size?: Size }>(
  (props, ref) => <Button ref={ref} size="icon" {...props} />,
);
IconButton.displayName = 'IconButton';
