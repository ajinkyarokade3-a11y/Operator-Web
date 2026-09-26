import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessagesSquare, Send, Loader2, RefreshCw, Eye, AlertTriangle, CheckCheck } from 'lucide-react';
import { TourFlowApi } from '../../../services/api';
import type { TravelerOperatorChat, TravelerOperatorChatMessage } from '../../../types/tourflow';

interface TravelerChatPanelProps {
  tripId: string;
  tripTitle?: string;
  destinationName?: string;
  travelerName?: string | null;
}

const POLL_MS = 5000;
const MAX_BODY = 2000;

function formatTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function eligibilityHint(chat: TravelerOperatorChat | null, loadError: string | null): string | null {
  if (loadError || !chat || chat.enabled) return null;
  if (chat.status === 'waiting_for_traveler_confirmation') return 'Chat will be available once the traveler confirms this trip.';
  if (chat.status === 'waiting_for_operator_acceptance') return 'Chat will be available once this trip is approved and accepted (traveler-confirmed → approved → accepted).';
  if (chat.status === 'closed') return 'Chat is closed for this trip.';
  return chat.reason || 'Traveler chat is not available for this trip yet.';
}

export const TravelerChatPanel: React.FC<TravelerChatPanelProps> = ({ tripId, tripTitle, destinationName, travelerName }) => {
  const [chat, setChat] = useState<TravelerOperatorChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const initAttemptedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const el = timelineRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const applyChat = useCallback((next: TravelerOperatorChat | null) => {
    if (!next) return;
    const sorted = [...(next.messages || [])].sort((a, b) => {
      const t = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return Number.isFinite(t) && t !== 0 ? t : String(a.id).localeCompare(String(b.id));
    });
    setChat({ ...next, messages: sorted });
  }, []);

  const fetchChat = useCallback(async (opts?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (!opts?.silent) { setIsLoading(true); setLoadError(null); }
    try {
      const convo = await TourFlowApi.getTripChat(tripId);
      applyChat(convo);
      if (!opts?.silent) setLoadError(null);
    } catch (err: any) {
      const msg = String(err?.message || 'Could not load traveler chat.');
      if (!initAttemptedRef.current && /not.?found|no chat|404/i.test(msg)) {
        initAttemptedRef.current = true;
        try { const convo = await TourFlowApi.initializeTripChat(tripId); applyChat(convo); return; }
        catch { /* fall through */ }
      }
      if (!opts?.silent) setLoadError(msg);
    } finally {
      inFlightRef.current = false;
      if (!opts?.silent) setIsLoading(false);
    }
  }, [tripId, applyChat]);

  useEffect(() => {
    initAttemptedRef.current = false;
    setChat(null); setDraft(''); setSendError(null);
    fetchChat();
    pollRef.current = window.setInterval(() => {
      if (document.hidden) return;
      fetchChat({ silent: true });
    }, POLL_MS);
    return () => { if (pollRef.current !== null) window.clearInterval(pollRef.current); pollRef.current = null; };
  }, [tripId, fetchChat]);

  useEffect(() => { scrollToBottom(); }, [chat?.messages?.length, scrollToBottom]);

  const handleInit = async () => {
    setIsInitializing(true); setSendError(null);
    try { const convo = await TourFlowApi.initializeTripChat(tripId); applyChat(convo); }
    catch (err: any) { setSendError(err?.message || 'Could not start traveler chat.'); }
    finally { setIsInitializing(false); }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    if (body.length > MAX_BODY) { setSendError(`Message is too long (max ${MAX_BODY} characters).`); return; }
    setIsSending(true); setSendError(null);
    try {
      const sent: TravelerOperatorChatMessage = await TourFlowApi.sendTripChatMessage(tripId, body);
      setChat((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === sent.id)) return prev;
        return { ...prev, messages: [...prev.messages, sent] };
      });
      setDraft('');
      scrollToBottom();
      fetchChat({ silent: true });
    } catch (err: any) {
      setSendError(err?.message || 'Failed to send message. Your text was kept — try again.');
    } finally { setIsSending(false); }
  };

  const hint = eligibilityHint(chat, loadError);
  const messages = chat?.messages || [];
  const unread = chat?.unread_count || 0;

  return (
    <div className="flex flex-col min-h-[420px] max-h-[640px]">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-neutral-800 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <MessagesSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-neutral-200">#{tripId}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              <Eye className="w-3 h-3" /> Visible to traveler
            </span>
            {unread > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white text-black">{unread} new</span>
            )}
          </div>
          <div className="text-sm font-bold text-white mt-1 truncate">
            {travelerName ? `Chat with ${travelerName}` : 'Chat with traveler'}
            {tripTitle ? <span className="text-neutral-400 font-semibold"> · {tripTitle}</span> : null}
          </div>
          <div className="text-[11px] text-neutral-500">
            {destinationName || 'Destination TBD'}
            {chat?.latest_message_at ? ` · Last ${formatTime(chat.latest_message_at)}` : ' · No messages yet'}
          </div>
        </div>
        <button onClick={() => fetchChat()} disabled={isLoading} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-semibold border border-neutral-700 flex items-center space-x-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      {isLoading && messages.length === 0 && !loadError ? (
        <div className="flex-1 flex items-center justify-center py-10 text-neutral-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading traveler chat…
        </div>
      ) : loadError && !chat ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <p className="text-xs text-neutral-300 max-w-sm">{loadError}</p>
          <button onClick={() => fetchChat()} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700">Retry</button>
        </div>
      ) : hint ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-2">
          <MessagesSquare className="w-6 h-6 text-neutral-600" />
          <p className="text-xs text-neutral-300 max-w-sm">{hint}</p>
          <p className="text-[11px] text-neutral-500">Backend status: {chat?.status}</p>
        </div>
      ) : (
        <div ref={timelineRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1" style={{ minHeight: 220 }}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-neutral-300 font-semibold">No messages yet — start the conversation.</p>
              <p className="text-[11px] text-neutral-500 mt-1">The first message initializes the chat.</p>
              <button onClick={handleInit} disabled={isInitializing} className="mt-3 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-bold">
                {isInitializing ? 'Starting…' : 'Start Traveler Chat'}
              </button>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_type === 'operator';
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${mine ? 'bg-white text-black border-white rounded-br-md' : 'bg-neutral-800 text-neutral-100 border-neutral-700 rounded-bl-md'}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${mine ? 'text-neutral-500' : 'text-emerald-400'}`}>
                      {mine ? 'You (operator)' : 'Traveler'}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{m.body}</div>
                    <div className={`flex items-center gap-1 mt-1 text-[10px] font-mono ${mine ? 'text-neutral-500 justify-end' : 'text-neutral-500'}`}>
                      <span>{formatTime(m.created_at)}</span>
                      {mine && m.is_read && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {!hint && (
        <div className="border-t border-neutral-800 pt-3 mt-2">
          <textarea
            id={`traveler-chat-composer-${tripId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={2}
            maxLength={MAX_BODY}
            placeholder="Write a message the traveler will see…"
            disabled={!chat?.enabled || isSending}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/60 disabled:opacity-50 resize-y"
          />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-neutral-500 font-mono">{draft.trim().length}/{MAX_BODY}</span>
            <button
              id={`btn-send-traveler-chat-${tripId}`}
              onClick={handleSend}
              disabled={!draft.trim() || isSending || !chat?.enabled}
              className="ml-auto px-4 py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isSending ? 'Sending…' : 'Send to traveler'}</span>
            </button>
          </div>
          {sendError && (
            <p className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">{sendError}</p>
          )}
        </div>
      )}
    </div>
  );
};
