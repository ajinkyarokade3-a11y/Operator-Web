import React from 'react';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const baseInput: React.CSSProperties = {
  width: '100%',
  height: 'var(--input-height)',
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  padding: '0 12px',
  outline: 'none',
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
};

function FieldWrap({ label, error, hint, required, children }: React.PropsWithChildren<FieldProps>) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-xs)' }}>
      {label ? (
        <span style={{ fontWeight: 600, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontSize: '11px' }}>
          {label} {required ? <span style={{ color: 'var(--color-danger)' }}>*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{error}</span> : hint ? <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{hint}</span> : null}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, error, hint, required, style, onFocus, onBlur, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDesc, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const errId = error ? `${props.id || props.name || 'field'}-error` : undefined;
    const hintId = !error && hint ? `${props.id || props.name || 'field'}-hint` : undefined;
    return (
      <FieldWrap label={label} error={error} hint={hint} required={required}>
        <input
          ref={ref}
          aria-invalid={!!error || (ariaInvalid as any)}
          aria-describedby={ariaDesc || errId || hintId}
          style={{
            ...baseInput,
            borderColor: error ? 'var(--color-danger-border)' : focused ? 'var(--color-border-focus)' : 'var(--color-border)',
            boxShadow: focused ? 'var(--focus-ring)' : 'none',
            ...style,
          }}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
        {errId ? <span id={errId} style={{ display: 'none' }}>{error}</span> : null}
      </FieldWrap>
    );
  },
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, error, hint, required, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <FieldWrap label={label} error={error} hint={hint} required={required}>
        <textarea
          ref={ref}
          style={{
            ...baseInput,
            height: 'auto',
            minHeight: 80,
            padding: '10px 12px',
            resize: 'vertical' as const,
            borderColor: error ? 'var(--color-danger-border)' : focused ? 'var(--color-border-focus)' : 'var(--color-border)',
            boxShadow: focused ? 'var(--focus-ring)' : 'none',
            ...style,
          }}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
      </FieldWrap>
    );
  },
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ label, error, hint, required, children, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <FieldWrap label={label} error={error} hint={hint} required={required}>
        <select
          ref={ref}
          style={{
            ...baseInput,
            borderColor: error ? 'var(--color-danger-border)' : focused ? 'var(--color-border-focus)' : 'var(--color-border)',
            boxShadow: focused ? 'var(--focus-ring)' : 'none',
            ...style,
          }}
          onFocus={(e) => { setFocused(true); onFocus?.(e as any); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e as any); }}
          {...props}
        >
          {children}
        </select>
      </FieldWrap>
    );
  },
);
Select.displayName = 'Select';

export const SearchInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { onValueChange?: (v: string) => void }> = ({ onValueChange, onChange, style, ...props }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'inline-flex', pointerEvents: 'none' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </span>
      <input
        style={{
          ...baseInput,
          paddingLeft: 36,
          borderColor: focused ? 'var(--color-border-focus)' : 'var(--color-border)',
          boxShadow: focused ? 'var(--focus-ring)' : 'none',
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => { onChange?.(e); onValueChange?.(e.target.value); }}
        {...props}
      />
    </div>
  );
};
