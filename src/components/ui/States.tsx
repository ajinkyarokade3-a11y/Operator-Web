import React from 'react';
import { Card } from './Card';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <Card style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
    <div style={{ width: 28, height: 28, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
    <div style={{ fontSize: 'var(--text-sm)' }}>{label}</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </Card>
);

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <Card style={{ padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    {icon ? <div style={{ color: 'var(--color-text-faint)' }}>{icon}</div> : null}
    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</div>
    {description ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 420 }}>{description}</div> : null}
    {action}
  </Card>
);

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <Card role="alert" style={{ padding: 16, background: 'var(--color-danger-soft)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
    <strong>Error:</strong> {message}
  </Card>
);
