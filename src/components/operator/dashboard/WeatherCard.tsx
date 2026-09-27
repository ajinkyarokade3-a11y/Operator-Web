import React from 'react';
import { Cloud, CloudRain, CloudSnow, CloudLightning, Sun, Droplets, Wind, Thermometer, Eye } from 'lucide-react';
import type { WeatherResponse } from '../../../types/tourflow';

function conditionIcon(condition: string | null | undefined) {
  const c = (condition ?? '').toLowerCase();
  if (c.includes('thunder') || c.includes('lightning')) return CloudLightning;
  if (c.includes('snow') || c.includes('blizzard') || c.includes('ice')) return CloudSnow;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return CloudRain;
  if (c.includes('cloud') || c.includes('overcast')) return Cloud;
  return Sun;
}

function severityLabel(severity: string | null | undefined): string {
  switch ((severity ?? '').toLowerCase()) {
    case 'low':
      return 'Low weather risk';
    case 'moderate':
      return 'Moderate weather risk';
    case 'high':
      return 'High weather risk';
    case 'severe':
      return 'Severe weather risk';
    default:
      return 'Weather risk unavailable';
  }
}

function severityColor(severity: string | null | undefined): string {
  switch ((severity ?? '').toLowerCase()) {
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

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDayLabel(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return timestamp;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, tomorrow)) return 'Tomorrow';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return timestamp;
  }
}

interface WeatherCardProps {
  weather: WeatherResponse | null;
  loading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Cloud className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Weather</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-neutral-600 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-neutral-400">Loading current conditions...</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Cloud className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Weather</h3>
        </div>
        <p className="text-xs text-neutral-400">Loading current conditions...</p>
      </div>
    );
  }

  if (!weather.available) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
        <div className="flex items-center space-x-2 mb-3">
          <Cloud className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Weather</h3>
        </div>
        <p className="text-xs text-neutral-400">Live weather currently unavailable.</p>
      </div>
    );
  }

  const { current, forecast, observed_at } = weather;
  const ConditionIcon = conditionIcon(current?.condition);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Weather</h3>
        </div>
        <div className="flex items-center space-x-1.5 text-neutral-400">
          <ConditionIcon size={16} />
          <span className="text-xs">{current?.condition ?? 'Unknown'}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {current?.temperature != null ? `${Math.round(current.temperature)}°C` : '--'}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Feels like {current?.feels_like != null ? `${Math.round(current.feels_like)}°C` : '--'}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="flex items-center space-x-1.5">
          <Droplets size={14} className="text-neutral-500" />
          <span className="text-[11px] text-neutral-400">
            Humidity {current?.humidity != null ? `${Math.round(current.humidity)}%` : '--'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <CloudRain size={14} className="text-neutral-500" />
          <span className="text-[11px] text-neutral-400">
            Precip {current?.precipitation != null ? `${current.precipitation} mm` : '--'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Wind size={14} className="text-neutral-500" />
          <span className="text-[11px] text-neutral-400">
            Wind {current?.wind_speed != null ? `${Math.round(current.wind_speed)} km/h` : '--'}
          </span>
        </div>
      </div>

      <p className={`mt-2 text-xs font-semibold ${severityColor(current?.severity)}`}>
        {severityLabel(current?.severity)}
      </p>

      {forecast && forecast.length > 0 && (
        <div className="mt-3 border-t border-neutral-800 pt-3">
          <p className="text-xs font-semibold text-neutral-300 mb-2">Upcoming Forecast</p>
          <div className="space-y-1">
            {forecast.slice(0, 5).map((item, i) => {
              const Icon = conditionIcon(item.condition);
              return (
                <div key={`${item.timestamp}-${i}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon size={14} className="text-neutral-500" />
                    <span className="text-[11px] text-neutral-300">{formatDayLabel(item.timestamp)}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {item.temperature != null ? `${Math.round(item.temperature)}°C` : '--'}
                    {item.condition ? ` · ${item.condition}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {observed_at && (
        <p className="mt-2 text-[10px] text-neutral-500">Updated {formatTime(observed_at)}</p>
      )}
    </div>
  );
};
