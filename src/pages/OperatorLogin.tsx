import React, { useState } from 'react';
import { Shield, KeyRound, Mail, ArrowRight, CheckCircle2, Compass, AlertCircle } from 'lucide-react';
import { TourFlowApi } from '../services/api';

interface OperatorLoginProps {
  onLoginSuccess: (user: { email: string; name: string; role: string; operator_name: string }) => void;
  onSwitchToTraveler: () => void;
}

export const OperatorLogin: React.FC<OperatorLoginProps> = ({ onLoginSuccess, onSwitchToTraveler }) => {
  const [email, setEmail] = useState('operator@tourflow.ai');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await TourFlowApi.operatorLogin(email.trim(), password);
      if (res?.success && res?.user) {
        onLoginSuccess({
          email: res.user.email,
          name: res.user.name || 'Rajesh Sharma',
          role: res.user.role || 'operator',
          operator_name: res.user.operator_name || 'Himalayan Trails Tour Operations',
        });
      } else {
        setError(res?.detail || 'Invalid operator credentials. Use operator@tourflow.ai / demo123');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Use operator@tourflow.ai / demo123');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('operator@tourflow.ai');
    setPassword('demo123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between text-neutral-100 relative overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neutral-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-600 border border-white/10 flex items-center justify-center text-white font-bold shadow-lg shadow-black/40">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span>TourFlow AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-200 font-mono font-medium border border-white/15">
                OPERATOR PORTAL
              </span>
            </div>
            <p className="text-xs text-neutral-400">Enterprise Tour Management & Dispatch System</p>
          </div>
        </div>

        <button
          id="btn-switch-to-traveler-from-login"
          onClick={onSwitchToTraveler}
          className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-600 flex items-center space-x-1.5"
        >
          <span>Switch to Traveler View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-2xl p-8 shadow-xl backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-white/[0.06] text-white border border-white/15 mb-3 shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Operator Authentication</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Sign in to manage active tours, dispatch allotments, and execute AI replanning
            </p>
          </div>

          {/* Demo Credentials Quick Pill */}
          <div className="mb-6 bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 text-xs text-neutral-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demo Operator Account</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-neutral-200 hover:text-neutral-300 font-medium underline"
              >
                Auto-fill credentials
              </button>
            </div>
            <div className="font-mono text-neutral-400 text-[11px] space-y-0.5">
              <div>Email: <span className="text-neutral-200 font-bold text-neutral-200">operator@tourflow.ai</span></div>
              <div>Password: <span className="text-neutral-200">demo123</span></div>
              <div>Role: <span className="text-emerald-400 font-semibold">operator</span></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  id="input-operator-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@tourflow.ai"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300">Password</label>
                <span className="text-[11px] text-neutral-500">Encrypted 256-bit</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  id="input-operator-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                />
              </div>
            </div>

            <button
              id="btn-operator-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-xl shadow-lg shadow-black/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Operations Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
            <p className="text-xs text-neutral-500">
              Assigned Partner Agency: <strong className="text-neutral-300">Himalayan Trails Ltd.</strong>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-6 py-3 border-t border-neutral-900 text-center text-xs text-neutral-500 z-10">
        TourFlow AI Operations Network • Real-Time Synchronization with PostgreSQL Database
      </footer>
    </div>
  );
};
