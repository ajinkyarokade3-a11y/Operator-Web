import React, { useState } from 'react';
import { Cloud, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { TourFlowApi } from '../../../services/api';
import type { SimulationResponse } from '../../../types/tourflow';

const SCENARIOS = [
  { id: '', label: 'Current Weather' },
  { id: 'heavy_rain', label: 'Heavy Rain' },
  { id: 'high_wind', label: 'High Wind' },
  { id: 'severe', label: 'Severe Weather' },
  { id: 'unavailable', label: 'Unavailable' },
] as const;

function severityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'low':
      return 'text-emerald-400';
    case 'moderate':
      return 'text-amber-400';
    case 'high':
      return 'text-orange-400';
    case 'severe':
      return 'text-rose-400';
    default:
      return 'text-neutral-400';
  }
}

function impactTypeLabel(impactType: string | undefined): string {
  switch ((impactType || '').toLowerCase()) {
    case 'none':
      return 'No impact';
    case 'delay':
      return 'Delay';
    case 'modified':
      return 'Modified';
    case 'postponed':
      return 'Postponed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

function actionLabel(action: string | undefined): string {
  switch ((action || '').toLowerCase()) {
    case 'no_change':
      return 'No change';
    case 'monitor':
      return 'Monitor';
    case 'reschedule':
      return 'Reschedule';
    case 'move_indoors':
      return 'Move indoors';
    case 'cancel':
      return 'Cancel';
    default:
      return '—';
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message || '';
    if (msg.includes('Not Found') || msg.includes('404')) {
      return 'Simulation service not found. Please ensure the backend is up to date.';
    }
    if (msg.includes('Trip not found')) {
      return 'Trip could not be found. Please refresh the trip and try again.';
    }
    if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized')) {
      return 'You are not authorized to simulate this trip.';
    }
    if (msg.includes('502') || msg.includes('503') || msg.includes('unavailable')) {
      return 'Simulation service is temporarily unavailable.';
    }
    if (msg.includes('timed out') || msg.includes('timeout')) {
      return 'Simulation request timed out. Please try again.';
    }
    return msg;
  }
  return 'Simulation failed';
}

interface SimulationSectionProps {
  tripId: string;
}

export const SimulationSection: React.FC<SimulationSectionProps> = ({ tripId }) => {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await TourFlowApi.simulateTrip(tripId, scenario || undefined);
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
      <div className="flex items-center space-x-2 mb-1">
        <Cloud className="w-4 h-4 text-neutral-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Trip Simulation / What-if
        </h3>
      </div>
      <p className="text-[11px] text-neutral-500 mb-3">
        This is a what-if simulation. Your actual itinerary will not be changed.
      </p>

      <div className="mb-3">
        <label className="text-[11px] font-semibold text-neutral-300 block mb-1.5">
          Scenario
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                scenario === s.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
        <span>{loading ? 'Running...' : 'Run Simulation'}</span>
      </button>

      {error && (
        <div className="mt-3 bg-rose-950/40 border border-rose-500/50 rounded-xl px-3 py-2">
          <div className="flex items-center space-x-2 text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] font-semibold">{error}</span>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          {result.affected_items.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-white mb-1.5">
                {result.affected_items.length} item{result.affected_items.length === 1 ? '' : 's'} affected
              </p>
              <div className="space-y-1.5">
                {result.affected_items.map((item) => (
                  <div
                    key={item.item_id}
                    className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white">{item.title}</span>
                      <span className={`text-[10px] font-bold uppercase ${severityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{item.reason}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-neutral-400">
                        {impactTypeLabel(item.impact_type)}
                      </span>
                      {item.recommended_action && (
                        <span className="text-[10px] text-neutral-400">
                          · {actionLabel(item.recommended_action)}
                        </span>
                      )}
                    </div>
                    {item.estimated_delay_minutes != null && item.estimated_delay_minutes > 0 && (
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Est. delay: {item.estimated_delay_minutes} min
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.dependencies.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-white mb-1.5">Dependency Chain</p>
              <div className="space-y-1">
                {result.dependencies.map((dep, i) => (
                  <div key={i} className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-semibold text-neutral-200">{dep.source_title}</span>
                      <span className="text-neutral-500">→</span>
                      <span className="font-semibold text-neutral-200">{dep.target_title}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{dep.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.conflicts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-white mb-1.5">Conflicts</p>
              <div className="space-y-1">
                {result.conflicts.map((conflict, i) => (
                  <div key={i} className="rounded-xl bg-rose-950/30 border border-rose-500/30 px-3 py-2">
                    <span className="text-[11px] font-semibold text-rose-300">{conflict.item_title}</span>
                    <p className="text-[10px] text-rose-400 mt-0.5">{conflict.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2">
            <span className="text-[11px] font-semibold text-neutral-300">Replanning Required</span>
            <span
              className={`text-[11px] font-bold ${
                result.replanning_required ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {result.replanning_required ? 'Yes' : 'No'}
            </span>
          </div>

          <p className="text-[10px] text-neutral-500">
            Simulated at {new Date(result.simulation_timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};
