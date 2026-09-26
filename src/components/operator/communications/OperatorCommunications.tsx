import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, MessagesSquare, Search, ArrowRight, AlertTriangle } from 'lucide-react';
import { TourFlowApi } from '../../../services/api';
import type { Trip, TripMessageOverviewEntry, TravelerChatOverviewEntry } from '../../../types/tourflow';
import { TripCommunicationsPanel } from './TripCommunicationsPanel';
import { TravelerChatPanel } from './TravelerChatPanel';

interface OperatorCommunicationsProps {
  trips: Trip[];
  operatorName: string;
  initialTripId?: string | null;
  onSelectTrip: (tripId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  planning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  confirmed: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
  ongoing: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  completed: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
  cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  draft: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
};

export const OperatorCommunications: React.FC<OperatorCommunicationsProps> = ({
  trips,
  operatorName,
  initialTripId,
  onSelectTrip,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId || null);
  const [mode, setMode] = useState<'internal' | 'traveler'>('internal');
  const [overview, setOverview] = useState<Record<string, TripMessageOverviewEntry>>({});
  const [overviewError, setOverviewError] = useState(false);
  const [chatOverview, setChatOverview] = useState<Record<string, TravelerChatOverviewEntry>>({});
  const [chatOverviewError, setChatOverviewError] = useState(false);

  useEffect(() => {
    setSelectedTripId(initialTripId || null);
  }, [initialTripId]);

  useEffect(() => {
    let cancelled = false;
    TourFlowApi.getTripMessagesOverview()
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, TripMessageOverviewEntry> = {};
        (rows || []).forEach((row) => {
          map[row.trip_id] = row;
        });
        setOverview(map);
      })
      .catch(() => {
        if (!cancelled) setOverviewError(true);
      });
    TourFlowApi.getTripChatOverview()
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, TravelerChatOverviewEntry> = {};
        (rows || []).forEach((row) => {
          map[row.trip_id] = row;
        });
        setChatOverview(map);
      })
      .catch(() => {
        if (!cancelled) setChatOverviewError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTrips = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matches = (trips || []).filter((trip) => {
      if (!needle) return true;
      return (
        trip.id.toLowerCase().includes(needle) ||
        (trip.title || '').toLowerCase().includes(needle) ||
        (trip.destination?.name || '').toLowerCase().includes(needle) ||
        (trip.status || '').toLowerCase().includes(needle)
      );
    });
    // Trips with recent activity first; the rest keep portal order.
    return [...matches].sort((a, b) => {
      const aLatest = mode === 'internal'
        ? (overview[a.id]?.latest_at || '')
        : (chatOverview[a.id]?.latest_at || '');
      const bLatest = mode === 'internal'
        ? (overview[b.id]?.latest_at || '')
        : (chatOverview[b.id]?.latest_at || '');
      if (aLatest && bLatest) return bLatest.localeCompare(aLatest);
      if (aLatest) return -1;
      if (bLatest) return 1;
      return 0;
    });
  }, [trips, search, overview, chatOverview, mode]);

  useEffect(() => {
    if (!selectedTripId && filteredTrips.length > 0 && !search.trim()) {
      setSelectedTripId(filteredTrips[0].id);
    }
  }, [filteredTrips, selectedTripId, search]);

  const selectedTrip = (trips || []).find((t) => t.id === selectedTripId) || null;
  const totalMessages = Object.values(overview).reduce((sum, e) => sum + (e.message_count || 0), 0);
  const totalUrgent = Object.values(overview).reduce((sum, e) => sum + (e.urgent_count || 0), 0);
  const totalChatMessages = Object.values(chatOverview).reduce((sum, e) => sum + (e.message_count || 0), 0);
  const totalChatUnread = Object.values(chatOverview).reduce((sum, e) => sum + (e.unread_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Communications</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {mode === 'internal'
              ? 'Internal operator log per trip. Traveler-invisible — nothing here reaches the Traveler Dashboard.'
              : 'Bidirectional traveler chat per trip. Visible to traveler — enabled after traveler confirmation + operator approval/acceptance.'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {mode === 'internal' ? (
            <>
              <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold">
                {totalMessages} Logged Messages
              </span>
              {totalUrgent > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold animate-pulse">
                  {totalUrgent} Urgent
                </span>
              )}
            </>
          ) : (
            <>
              <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold">
                {totalChatMessages} Traveler Messages
              </span>
              {totalChatUnread > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-white text-black font-bold">
                  {totalChatUnread} Unread
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="comms-tab-internal"
          onClick={() => setMode('internal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${mode === 'internal' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Internal Notes · Traveler-invisible</span>
        </button>
        <button
          id="comms-tab-traveler"
          onClick={() => setMode('traveler')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${mode === 'traveler' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'}`}
        >
          <MessagesSquare className="w-3.5 h-3.5" />
          <span>Traveler Chat · Visible to traveler</span>
          {totalChatUnread > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${mode === 'traveler' ? 'bg-black text-white' : 'bg-white text-black'}`}>
              {totalChatUnread}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left: searchable trip list */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 lg:sticky lg:top-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -tranneutral-y-1/2" />
            <input
              id="comms-trip-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Trip ID, title, destination…"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/30"
            />
          </div>
          {overviewError && mode === 'internal' && (
            <p className="text-[11px] text-amber-300/90 px-1">
              Message counts unavailable — trip list still works.
            </p>
          )}
          {chatOverviewError && mode === 'traveler' && (
            <p className="text-[11px] text-amber-300/90 px-1">
              Chat counts unavailable — trip list still works.
            </p>
          )}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredTrips.length === 0 ? (
              <div className="text-center text-neutral-500 text-xs py-10">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                {search.trim() ? 'No trips match this search.' : 'No trips available yet.'}
              </div>
            ) : (
              filteredTrips.map((trip) => {
                const internalEntry = overview[trip.id];
                const chatEntry = chatOverview[trip.id];
                const isActive = trip.id === selectedTripId;
                return (
                  <button
                    key={trip.id}
                    id={`comms-trip-${trip.id}`}
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`w-full text-left rounded-xl p-3.5 border transition-colors ${
                      isActive
                        ? 'bg-white/10 border-white/20'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-neutral-200 truncate">
                        #{trip.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          STATUS_STYLES[trip.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1 line-clamp-1">
                      {trip.title || 'Untitled trip'}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                      <div>
                        {(trip.traveler_count || 0)} traveler{(trip.traveler_count || 0) === 1 ? '' : 's'}
                        {trip.travel_type ? ` (${trip.travel_type})` : ''} •{' '}
                        {trip.destination?.name || 'Destination TBD'}
                      </div>
                      <div className="text-neutral-500">
                        {trip.formatted_dates || [trip.start_date, trip.end_date].filter(Boolean).join(' → ') || 'Dates TBD'}
                        {trip.duration_days ? ` • ${trip.duration_days} days` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px]">
                      {mode === 'internal' ? (
                        internalEntry ? (
                          <>
                            <span className="text-neutral-400">
                              {internalEntry.message_count} message{internalEntry.message_count === 1 ? '' : 's'}
                            </span>
                            {internalEntry.urgent_count > 0 && (
                              <span className="flex items-center space-x-1 text-rose-300 font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{internalEntry.urgent_count} urgent</span>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-600">No messages yet</span>
                        )
                      ) : chatEntry ? (
                        <>
                          <span className="text-neutral-400">
                            {chatEntry.message_count} message{chatEntry.message_count === 1 ? '' : 's'}
                          </span>
                          {chatEntry.unread_count > 0 && (
                            <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-white text-black text-[10px]">
                              {chatEntry.unread_count} unread
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-neutral-600">No traveler chat yet</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main: selected trip timeline */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col min-h-[540px]">
          {!selectedTrip ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 py-16">
              <MessageSquare className="w-8 h-8 mb-2 text-neutral-600" />
              <div className="font-bold text-white text-sm">Select a trip</div>
              <p className="text-xs mt-1">Choose a trip from the list to open its communication timeline.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-neutral-800 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-neutral-200">#{selectedTrip.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        STATUS_STYLES[selectedTrip.status] || STATUS_STYLES.draft
                      }`}
                    >
                      {selectedTrip.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedTrip.title || 'Untitled trip'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {(selectedTrip.traveler_count || 0)} traveler{(selectedTrip.traveler_count || 0) === 1 ? '' : 's'}
                    {' • '}
                    {selectedTrip.destination?.name || 'Destination TBD'}
                    {' • '}
                    {selectedTrip.formatted_dates || 'Dates TBD'}
                  </p>
                </div>
                <button
                  id={`btn-open-workspace-from-comms-${selectedTrip.id}`}
                  onClick={() => onSelectTrip(selectedTrip.id)}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center space-x-1.5 transition-colors"
                >
                  <span>Open Trip Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {mode === 'internal' ? (
                <TripCommunicationsPanel
                  key={`internal-${selectedTrip.id}`}
                  tripId={selectedTrip.id}
                  operatorName={operatorName}
                />
              ) : (
                <TravelerChatPanel
                  key={`traveler-chat-${selectedTrip.id}`}
                  tripId={selectedTrip.id}
                  tripTitle={selectedTrip.title}
                  destinationName={selectedTrip.destination?.name}
                  travelerName={selectedTrip.traveler?.name}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
