import React from 'react';
import { Compass, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

interface OperatorHeaderProps {
  operatorUser: { email: string; name: string; role: string; operator_name: string };
  isSyncing: boolean;
  lastSyncTime: Date;
  onManualSync: () => void;
  onTriggerDisruptionDemo: () => void;
  onSwitchToTraveler: () => void;
  onLogout: () => void;
  unresolvedAlertCount: number;
}

export const OperatorHeader: React.FC<OperatorHeaderProps> = ({
  operatorUser, isSyncing, onManualSync, onTriggerDisruptionDemo, onSwitchToTraveler, onLogout, unresolvedAlertCount,
}) => {
  return (
    <header
      style={{
        flexShrink: 0, height: 56, zIndex: 40,
        background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-background-secondary) 100%)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(var(--blur-glass))',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #2B2B2B 0%, #101010 100%)',
            border: '1px solid var(--color-border-strong)', color: '#fff', flexShrink: 0,
          }}>
            <Compass size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--color-text-primary)', letterSpacing: 'var(--tracking-tight)' }}>WanderAI</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 999, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', border: '1px solid var(--color-accent-border)' }}>Operator</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{operatorUser.operator_name}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--color-border-strong)' }} />
              <span>North Hub</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', fontSize: 11 }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--color-success)', opacity: 0.35, animation: 'ping 1.5s infinite' }} />
              <span style={{ position: 'relative', width: 8, height: 8, borderRadius: 999, background: 'var(--color-success)', display: 'inline-block' }} />
            </span>
            <span style={{ color: 'var(--color-success)', fontWeight: 700, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', fontSize: 10 }}>Live</span>
            <button id="btn-manual-sync-operator" onClick={onManualSync} title="Sync" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'inline-flex' }}>
              <RefreshCw size={14} style={{ animation: isSyncing ? 'spin 0.8s linear infinite' : undefined }} />
            </button>
          </div>

          {unresolvedAlertCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 8, background: 'var(--color-danger-soft)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger)', fontSize: 11, fontWeight: 700 }}>
              <AlertTriangle size={13} /> {unresolvedAlertCount}
            </span>
          )}

          <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 2px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#2B2B2B 0%, #101010 100%)', border: '1px solid var(--color-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11 }}>
              {operatorUser.name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()}
            </div>
          </div>

          <button id="btn-operator-logout" onClick={onLogout} title="Sign out" style={{ width: 32, height: 32, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
    </header>
  );
};
