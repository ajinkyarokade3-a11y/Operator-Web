import React from 'react';
import { Radio, ExternalLink, AlertTriangle } from 'lucide-react';
import type { SocialResponse, SocialSignal, SourceType, Confidence } from '../../../types/tourflow';

function confidenceColor(confidence: string | null | undefined): string {
  switch ((confidence ?? '').toUpperCase()) {
    case 'HIGH':
      return 'text-emerald-400';
    case 'MEDIUM':
      return 'text-amber-400';
    case 'LOW':
      return 'text-orange-400';
    default:
      return 'text-neutral-400';
  }
}

function sourceTypeIcon(sourceType: SourceType | null | undefined): string {
  switch (sourceType) {
    case 'OFFICIAL':
      return '🏛';
    case 'NEWS':
      return '📰';
    case 'SOCIAL':
      return '💬';
    default:
      return '📡';
  }
}

function sourceTypeLabel(sourceType: SourceType | null | undefined): string {
  switch (sourceType) {
    case 'OFFICIAL':
      return 'Official';
    case 'NEWS':
      return 'News';
    case 'SOCIAL':
      return 'Public report';
    default:
      return 'Unknown';
  }
}

function signalTypeLabel(signalType: string | null | undefined): string {
  switch (signalType) {
    case 'TRAVELER_REPORT':
      return 'Traveler';
    case 'WEATHER_REPORT':
      return 'Weather';
    case 'TRANSPORT_REPORT':
      return 'Transport';
    case 'ROAD_CONDITION':
      return 'Road';
    case 'FLIGHT_DISRUPTION':
      return 'Flight';
    case 'TREND':
      return 'Trend';
    case 'EMERGING_CONDITION':
      return 'Emerging';
    default:
      return 'Signal';
  }
}

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = Date.now();
    const diffMs = now - d.getTime();
    if (diffMs < 0) return 'just now';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

function SignalItem({ signal }: { signal: SocialSignal }) {
  return (
    <div className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2">
      <div className="flex items-start gap-2">
        <span className="text-sm mt-0.5">{sourceTypeIcon(signal.source_type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-white truncate">
              {signal.title ?? 'Signal'}
            </p>
            <span className={`text-[10px] font-bold uppercase shrink-0 ${confidenceColor(signal.confidence)}`}>
              {signal.confidence ?? 'UNKNOWN'}
            </span>
          </div>
          {signal.summary && (
            <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">{signal.summary}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] text-neutral-500">
              {sourceTypeLabel(signal.source_type)}
            </span>
            {signal.source && (
              <span className="text-[10px] text-neutral-500">{signal.source}</span>
            )}
            {signal.signal_type && (
              <span className="text-[10px] text-neutral-500">
                {signalTypeLabel(signal.signal_type)}
              </span>
            )}
            {signal.weather_relation && signal.weather_relation !== 'UNKNOWN' && (
              <span className="text-[10px] text-neutral-500">
                Weather: {signal.weather_relation}
              </span>
            )}
            {signal.published_at && (
              <span className="text-[10px] text-neutral-500">
                {formatRelativeTime(signal.published_at)}
              </span>
            )}
          </div>
          {signal.source_url && (
            <a
              href={signal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 mt-1 inline-flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface SocialSignalsCardProps {
  social: SocialResponse | null;
  loading?: boolean;
  onRetry?: () => void;
}

export const SocialSignalsCard: React.FC<SocialSignalsCardProps> = ({ social, loading, onRetry }) => {
  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Radio className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Signals</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-neutral-600 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-neutral-400">Loading social signals...</span>
        </div>
      </div>
    );
  }

  if (!social) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Radio className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Signals</h3>
        </div>
        <p className="text-xs text-neutral-400">Loading social signals...</p>
      </div>
    );
  }

  if (!social.available) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Radio className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Signals</h3>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-xs text-neutral-400">Unable to load social signals.</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs font-semibold text-blue-400 hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const { signals, status, sources, generated_at } = social;

  if (signals.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Radio className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Signals</h3>
        </div>
        <p className="text-xs text-neutral-400">No relevant social signals found for this trip.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Signals</h3>
        </div>
        {status === 'partial' && (
          <span className="text-[10px] font-bold uppercase text-amber-400">
            Partial
          </span>
        )}
      </div>

      {status === 'partial' && (
        <p className="text-[11px] text-neutral-500 mb-2">
          Some sources unavailable. Showing available signals.
        </p>
      )}

      <div className="space-y-2">
        {signals.slice(0, 5).map((signal, i) => (
          <SignalItem key={i} signal={signal} />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2">
        {sources && sources.length > 0 && (
          <p className="text-[10px] text-neutral-500">
            Sources: {sources.join(', ')}
          </p>
        )}
        {generated_at && (
          <p className="text-[10px] text-neutral-500">
            Updated {formatRelativeTime(generated_at)}
          </p>
        )}
      </div>
    </div>
  );
};
