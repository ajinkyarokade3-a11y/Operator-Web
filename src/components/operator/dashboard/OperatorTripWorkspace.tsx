import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Building2, 
  Ticket, 
  History, 
  RefreshCw, 
  FileText, 
  Phone, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  Send,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Trip, ItineraryItem, Booking, ChangeHistory } from '../../../types/tourflow';
import { TourFlowApi } from '../../../services/api';
import { TripCommunicationsPanel } from '../communications/TripCommunicationsPanel';
import { TravelerChatPanel } from '../communications/TravelerChatPanel';

interface OperatorTripWorkspaceProps {
  trip: Trip;
  onBack: () => void;
  onTripUpdated: (updatedTrip: Trip) => void;
  onTriggerDisruptionDemo: () => void;
  operatorName?: string;
}

export const OperatorTripWorkspace: React.FC<OperatorTripWorkspaceProps> = ({
  trip,
  onBack,
  onTripUpdated,
  onTriggerDisruptionDemo,
  operatorName,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'bookings' | 'vendors' | 'history' | 'preview' | 'communications' | 'traveler_chat'>('itinerary');
  const [isAnalyzingImpact, setIsAnalyzingImpact] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string>('');
  const [operatorNotes, setOperatorNotes] = useState<string>('Approved alternative based on traveler adventure preferences and verified immediate vendor capacity.');
  const [isApplyingReplan, setIsApplyingReplan] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [replanSuccessSummary, setReplanSuccessSummary] = useState<any | null>(null);

  // Check if trip has active unresolved disruption
  const activeCriticalAlert = trip.alerts?.find((a) => !a.is_resolved && (a.severity === 'critical' || a.severity === 'warning'));
  const hasGroundedItem = trip.itinerary?.some((i) => i.status === 'skipped' || i.title?.toLowerCase().includes('paragliding') && trip.alerts?.some(a => !a.is_resolved));

  // Run AI disruption impact analysis (does NOT modify the itinerary)
  const handleRunImpactAnalysis = async () => {
    setIsAnalyzingImpact(true);
    setAnalysisError(null);
    try {
      const payload = activeCriticalAlert
        ? { alert_id: activeCriticalAlert.id }
        : {
            disruption: {
              type: 'weather',
              severity: 'warning',
              title: 'Severe Alpine Wind Shear at Solang Valley',
              description: '48 km/h wind shear grounding paragliding flights',
            },
          };
      const res = await TourFlowApi.runDisruptionAnalysis(trip.id, payload);
      setImpactAnalysis(res);
      if (res?.alternatives?.length > 0) {
        setSelectedAlternativeId(res.alternatives[0].activity_id);
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to run disruption analysis');
    } finally {
      setIsAnalyzingImpact(false);
    }
  };

  // Dismiss the disruption without changing the itinerary
  const handleDismissDisruption = async () => {
    setIsDismissing(true);
    setAnalysisError(null);
    try {
      await TourFlowApi.dismissDisruption(trip.id, operatorNotes || 'Operator dismissed the disruption without itinerary changes.');
      // Re-fetch the trip so alert states update; the itinerary itself is unchanged.
      const updatedTrip = await TourFlowApi.getOperatorTrip(trip.id);
      if (updatedTrip) onTripUpdated(updatedTrip);
      setImpactAnalysis(null);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to dismiss disruption');
    } finally {
      setIsDismissing(false);
    }
  };

  // Approve & Apply Replan
  const handleApproveReplan = async () => {
    if (!selectedAlternativeId) return;
    setIsApplyingReplan(true);
    setAnalysisError(null);
    try {
      const res = await TourFlowApi.applyReplan(trip.id, selectedAlternativeId, operatorNotes);
      if (res?.success && res?.trip) {
        onTripUpdated(res.trip);
        setReplanSuccessSummary(res.summary);
        setImpactAnalysis(null);
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to apply replan');
    } finally {
      setIsApplyingReplan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-4">
          <button
            id="btn-back-to-dashboard"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors flex-shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-neutral-500/20 text-neutral-300 border border-neutral-500/30">
                TOUR #{trip.id}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                trip.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                trip.status === 'confirmed' ? 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {trip.status}
              </span>
              {activeCriticalAlert && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>ACTION REQUIRED</span>
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-white mt-1.5">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>{trip.origin} → {trip.destination?.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-neutral-500" />
                <span>{trip.traveler_count} Travelers ({trip.travel_type})</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{trip.formatted_dates} ({trip.duration_days} Days)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id={`btn-open-traveler-chat-${trip.id}`}
            onClick={() => setActiveTab('traveler_chat')}
            title="Open bidirectional chat with the traveler (visible to traveler; enabled after confirmation + approval/acceptance)"
            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Chat with Traveler</span>
          </button>
          <button
            id="btn-simulate-disruption-workspace"
            onClick={onTriggerDisruptionDemo}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            title="Inject real-time wind shear disruption at Solang Valley"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulate Disruption</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs">
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Package Total</div>
            <div className="font-bold text-emerald-400 font-mono text-sm">
              ₹{(trip.total_cost || trip.total_budget || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-neutral-800 overflow-x-auto pb-px">
        {[
          { id: 'itinerary', label: 'Interactive Itinerary & AI Replan', icon: Sparkles },
          { id: 'overview', label: 'Operations Overview', icon: FileText },
          { id: 'bookings', label: `Bookings (${trip.bookings?.length || 0})`, icon: Ticket },
          { id: 'vendors', label: 'Assigned Vendors', icon: Building2 },
          { id: 'history', label: `Audit Log (${trip.change_history?.length || 0})`, icon: History },
          { id: 'communications', label: 'Internal Notes', icon: MessageSquare },
          { id: 'traveler_chat', label: 'Traveler Chat', icon: Send },
          { id: 'preview', label: 'Traveler View Live', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-white bg-neutral-800/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: ITINERARY & AI REPLAN */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Active Disruption Banner if Alert Present */}
          {(activeCriticalAlert || hasGroundedItem) && !replanSuccessSummary && (
              <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      INCIDENT IN PROGRESS: DAY 3 SOLANG VALLEY
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {activeCriticalAlert?.title || 'Severe Alpine Wind Shear Warning (48 km/h) at Solang Valley'}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 max-w-3xl">
                    {activeCriticalAlert?.description || 'All tandem paragliding grounded by Himachal Tourism Authority. 4 passengers affected. Operational replanning is urgently recommended to protect guest experience.'}
                  </p>

                  {/* Impact Analysis & Replan Trigger Buttons */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                      id="btn-run-impact-analysis"
                      onClick={handleRunImpactAnalysis}
                      disabled={isAnalyzingImpact}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                      {isAnalyzingImpact ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                      <span>{impactAnalysis ? 'Re-run Impact Analysis' : 'Run Disruption Impact Analysis & AI Replan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replan Success Announcement Banner */}
          {replanSuccessSummary && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-5 shadow-lg text-xs space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>AI Replan Successfully Executed & Synchronized Across Platform!</span>
              </div>
              <p className="text-neutral-300">
                The canonical itinerary, central bookings, package ledger, and traveler notifications have all been updated immediately in the shared database.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <div className="text-neutral-400 text-[10px]">NEW CONFIRMED ACTIVITY</div>
                  <div className="text-white font-bold text-xs mt-0.5">{replanSuccessSummary.new_activity}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <div className="text-neutral-400 text-[10px]">BOOKING VOUCHER REF</div>
                  <div className="text-emerald-400 font-mono font-bold text-xs mt-0.5">{replanSuccessSummary.booking_reference}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <div className="text-neutral-400 text-[10px]">PACKAGE SAVINGS / REFUND</div>
                  <div className="text-white font-bold text-xs mt-0.5">₹{replanSuccessSummary.cost_savings.toLocaleString()} Adjusted</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                  <div className="text-neutral-400 text-[10px]">TRAVELER DISPATCH</div>
                  <div className="text-neutral-200 font-semibold text-xs mt-0.5">SMS & App Push Sent</div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Error Banner */}
          {analysisError && !replanSuccessSummary && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 shadow-md">
              <div className="flex items-center space-x-2 text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">{analysisError}</span>
              </div>
            </div>
          )}

          {/* Impact Analysis Details Card */}
          {impactAnalysis && !replanSuccessSummary && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Automated Disruption Impact Report
                  </h3>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {impactAnalysis.source || 'ai'} • {new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Disruption cause & severity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    impactAnalysis.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {impactAnalysis.severity || 'warning'}
                  </span>
                  {impactAnalysis.status && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-500/20 text-neutral-300 border border-neutral-500/30">
                      {String(impactAnalysis.status).replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">{impactAnalysis.disruption_cause || 'Unknown disruption'}</h4>
                {impactAnalysis.impact_summary && (
                  <p className="text-xs text-neutral-400">{impactAnalysis.impact_summary}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
                  {impactAnalysis.affected_day != null && (
                    <span>Affected Day: <strong className="text-neutral-200">Day {impactAnalysis.affected_day}</strong></span>
                  )}
                  {impactAnalysis.affected_activity && (
                    <span>Activity: <strong className="text-neutral-200">{impactAnalysis.affected_activity}</strong></span>
                  )}
                </div>
              </div>

              {/* Impact metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Affected Items</div>
                  <div className="text-lg font-bold text-white mt-0.5">{impactAnalysis.affected_items?.length || 0}</div>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Affected Bookings</div>
                  <div className="text-lg font-bold text-white mt-0.5">{impactAnalysis.affected_bookings?.length || 0}</div>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Affected Vendors</div>
                  <div className="text-lg font-bold text-white mt-0.5">{impactAnalysis.affected_vendors?.length || 0}</div>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Est. Cost Impact</div>
                  <div className="text-lg font-bold text-rose-400 mt-0.5">
                    {impactAnalysis.estimated_cost_impact != null ? `₹${Number(impactAnalysis.estimated_cost_impact).toLocaleString()}` : '—'}
                  </div>
                </div>
              </div>

              {/* Affected itinerary items */}
              {impactAnalysis.affected_items?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Affected Itinerary Items</h4>
                  <div className="space-y-1.5">
                    {impactAnalysis.affected_items.map((item: any) => (
                      <div key={item.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-neutral-400 font-mono">Day {item.day_number}</span>
                          <span className="ml-2 font-bold text-white">{item.title}</span>
                          {item.location && <span className="ml-2 text-neutral-400">• {item.location}</span>}
                        </div>
                        <span className="text-neutral-400 capitalize">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected bookings */}
              {impactAnalysis.affected_bookings?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Affected Bookings</h4>
                  <div className="space-y-1.5">
                    {impactAnalysis.affected_bookings.map((b: any, i: number) => (
                      <div key={b.id || i} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{b.vendor_name || b.booking_reference || 'Booking'}</span>
                          {b.impact && <span className="ml-2 text-neutral-400">• {b.impact}</span>}
                        </div>
                        {b.amount != null && <span className="font-mono text-rose-400">₹{Number(b.amount).toLocaleString()}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected vendors */}
              {impactAnalysis.affected_vendors?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Affected Vendors</h4>
                  <div className="space-y-1.5">
                    {impactAnalysis.affected_vendors.map((v: any, i: number) => (
                      <div key={v.id || i} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{v.name || v.vendor_name || 'Vendor'}</span>
                          {v.vendor_type && <span className="ml-2 text-neutral-400 uppercase text-[10px]">• {v.vendor_type}</span>}
                          {v.impact && <span className="ml-2 text-neutral-400">• {v.impact}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport changes */}
              {impactAnalysis.transport_changes?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Transport Changes</h4>
                  <div className="space-y-1.5">
                    {impactAnalysis.transport_changes.map((tc: any, i: number) => (
                      <div key={i} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                        {tc.description}
                        {tc.required && <span className="ml-2 text-rose-400 font-bold">Required</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule impact */}
              {impactAnalysis.estimated_schedule_impact && (
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
                  <span className="text-neutral-400 uppercase text-[10px] font-bold">Schedule Impact</span>
                  <p className="text-neutral-200 mt-1">{impactAnalysis.estimated_schedule_impact}</p>
                </div>
              )}

              {/* Risks & limitations */}
              {impactAnalysis.risks_limitations?.length > 0 && (
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
                  <span className="text-neutral-400 uppercase text-[10px] font-bold">Risks & Limitations</span>
                  <ul className="list-disc list-inside text-neutral-300 mt-1 space-y-0.5">
                    {impactAnalysis.risks_limitations.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gemini AI Ranked Alternatives */}
              {impactAnalysis.alternatives?.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <span>Ranked AI Replanning Candidates (Gemini Engine)</span>
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-medium">All vendors capacity-verified</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {impactAnalysis.alternatives.map((alt: any) => {
                      const isSelected = selectedAlternativeId === alt.activity_id;
                      return (
                        <div
                          key={alt.activity_id}
                          onClick={() => setSelectedAlternativeId(alt.activity_id)}
                          className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-neutral-800/90 border-emerald-500 shadow-lg shadow-black/40 ring-1 ring-emerald-500'
                              : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                AI Suggested
                              </span>
                              <span className="text-xs font-mono font-bold text-white">
                                ₹{Number(alt.cost || 0).toLocaleString()} {alt.currency || 'INR'}
                              </span>
                            </div>

                            <h5 className="font-bold text-white text-sm">{alt.title}</h5>
                            <p className="text-xs text-neutral-400 line-clamp-3">{alt.rationale}</p>

                            <div className="text-[11px] text-neutral-400 space-y-1 pt-1 border-t border-neutral-800/80">
                              {alt.location && <div>Location: <strong className="text-neutral-300">{alt.location}</strong></div>}
                              {alt.duration_hours != null && <div>Duration: <strong className="text-neutral-300">{alt.duration_hours}h</strong></div>}
                              {alt.estimated_time_impact && <div>Time impact: <strong className="text-neutral-300">{alt.estimated_time_impact}</strong></div>}
                            </div>

                            {alt.risks?.length > 0 && (
                              <div className="text-[11px] text-rose-300/80 space-y-0.5">
                                {alt.risks.map((r: string, i: number) => (
                                  <div key={i}>• {r}</div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                            <span className="text-emerald-400 text-[11px]">Pending Approval</span>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'bg-white border-white text-black' : 'border-neutral-700 text-transparent'
                            }`}>
                              <Check className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Operator Approval Note & Execution Form */}
              <div className="mt-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Operator Replan Justification & Dispatch Notes
                  </label>
                  <input
                    type="text"
                    value={operatorNotes}
                    onChange={(e) => setOperatorNotes(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-400"
                    placeholder="Enter operator approval notes..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-1">
                  <button
                    id="btn-dismiss-disruption"
                    onClick={handleDismissDisruption}
                    disabled={isDismissing}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl border border-neutral-700 flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isDismissing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Dismiss Disruption</span>
                  </button>
                  <button
                    id="btn-approve-and-execute-replan"
                    onClick={handleApproveReplan}
                    disabled={isApplyingReplan || !selectedAlternativeId}
                    className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl shadow-lg shadow-black/40 flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isApplyingReplan ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    )}
                    <span>Approve & Dispatch AI Replan to Traveler</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Day-by-Day Canonical Itinerary View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Tour Schedule & Milestone Timeline</h3>
              <span className="text-xs text-neutral-400">5 Days • 11 Verified Allotments</span>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((dayNum) => {
                const dayItems = (trip.itinerary || []).filter((i) => i.day_number === dayNum);
                return (
                  <div key={dayNum} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
                          {dayNum}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {dayNum === 1 ? 'Arrival & Mountain Ascent to Manali' :
                           dayNum === 2 ? 'Hadimba Forest & Rohtang Snow Point' :
                           dayNum === 3 ? 'Solang Valley Adventure Day' :
                           dayNum === 4 ? 'Naggar Castle & Heritage Culture' :
                           'Departure Descent to Chandigarh'}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">
                        {dayItems.length} activities
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dayItems.map((item) => {
                        const isGrounded = item.status === 'skipped' || (item.title?.toLowerCase().includes('paragliding') && trip.alerts?.some(a => !a.is_resolved));

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              isGrounded
                                ? 'bg-rose-950/30 border-rose-500/50'
                                : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  item.item_type === 'hotel' ? 'bg-neutral-500/20 text-neutral-300' :
                                  item.item_type === 'transport' ? 'bg-neutral-500/20 text-neutral-300' :
                                  'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {item.item_type}
                                </span>
                                <span className="text-xs text-neutral-400 font-mono">{item.start_time || 'All Day'}</span>
                                {isGrounded && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                                    GROUNDED / CANCELLED
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-white">{item.title}</div>
                              {item.description && (
                                <p className="text-[11px] text-neutral-400">{item.description}</p>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center flex-shrink-0 text-xs">
                              <span className="font-mono font-bold text-white">
                                {item.cost ? `₹${item.cost.toLocaleString()}` : 'Included'}
                              </span>
                              <span className={`text-[10px] font-medium capitalize ${
                                isGrounded ? 'text-rose-400 font-bold' : 'text-emerald-400'
                              }`}>
                                {item.status || 'Confirmed'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OPERATIONS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Flight & Chauffeur Logistics</h3>
            <div className="space-y-3 text-xs">
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Inbound Flight</div>
                <div className="font-bold text-white text-sm mt-0.5">IndiGo 6E-512 (BOM → IXC)</div>
                <div className="text-emerald-400 mt-1">Confirmed on-time • 4 passengers</div>
              </div>
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Assigned Mountain Chauffeur</div>
                <div className="font-bold text-white text-sm mt-0.5">Toyota Fortuner 4x4 (HP-01-A-8841)</div>
                <div className="text-neutral-300 mt-1">Driver: Rajinder Verma (+91 98160 44219)</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hospitality & Emergency Desk</h3>
            <div className="space-y-3 text-xs">
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Resort Reservation</div>
                <div className="font-bold text-white text-sm mt-0.5">The Himalayan Luxury Castle & Spa</div>
                <div className="text-neutral-300 mt-1">2 Victorian Balcony Chambers • Front Desk: (+91 1902 250123)</div>
              </div>
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Himalayan Trails 24/7 Operations Desk</div>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">Duty Officer: Rajesh Sharma</div>
                <div className="text-neutral-300 mt-1">Emergency Hotline: (+91 1902 258800)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS & ALLOTMENTS */}
      {activeTab === 'bookings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Central Vouchers & Allotments</h3>
              <p className="text-xs text-neutral-400">Direct integration with partner reservation ledgers</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">{trip.bookings?.length || 0} Bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/60 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3">Voucher Ref</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Vendor / Service</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {(trip.bookings || []).map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-800/30">
                    <td className="px-5 py-3.5 font-mono font-bold text-neutral-200">{b.booking_reference}</td>
                    <td className="px-5 py-3.5 uppercase text-[11px] font-semibold text-neutral-400">{b.item_type}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{b.vendor_id}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-white">₹{b.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                        b.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-emerald-400 font-semibold uppercase text-[10px]">{b.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'The Himalayan Luxury Castle', category: 'Hotel Resort', rating: 4.9, phone: '+91 1902 250123', contact: 'Manali Hadimba Road' },
            { name: 'Kullu Mountain 4x4 Chauffeurs', category: 'Transport', rating: 4.85, phone: '+91 98160 44219', contact: 'Rajinder Verma (Fleet Lead)' },
            { name: 'Himalayan Rapids Kayaking Co.', category: 'Adventure Activities', rating: 4.95, phone: '+91 98160 77124', contact: 'Capt. Sunil Negi' },
            { name: 'IndiGo Airlines Partner Desk', category: 'Flights', rating: 4.8, phone: '1800 180 1407', contact: 'Priority Agent Terminal' },
          ].map((v, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                  {v.category}
                </span>
                <h4 className="font-bold text-white text-sm mt-1">{v.name}</h4>
                <div className="text-xs text-neutral-400 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-neutral-500" />
                  <span>{v.phone} • {v.contact}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-400 font-mono">★ {v.rating}</div>
                <span className="text-[10px] text-emerald-400 font-medium">SLA Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: CHANGE HISTORY AUDIT */}
      {activeTab === 'history' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Canonical Audit Log</h3>
            <span className="text-xs text-neutral-400">PostgreSQL Immutable History</span>
          </div>

          <div className="space-y-3">
            {(trip.change_history || []).map((chg) => (
              <div key={chg.id} className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-200 capitalize">{chg.action.replace('_', ' ')}</span>
                  <span className="text-neutral-500 font-mono text-[11px]">{new Date(chg.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-neutral-300">
                  By: <strong className="text-white capitalize">{chg.changed_by}</strong> • Field: <code className="text-amber-300 font-mono">{chg.field_changed}</code>
                </div>
                {chg.reason && (
                  <p className="text-neutral-400 italic text-[11px]">"{chg.reason}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TRIP COMMUNICATIONS (internal operator log) */}
      {activeTab === 'communications' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Internal Notes</h3>
              <p className="text-xs text-neutral-400">Internal operator log — traveler-invisible. Never shown in Traveler Chat.</p>
            </div>
          </div>
          <TripCommunicationsPanel
            key={`internal-${trip.id}`}
            tripId={trip.id}
            operatorName={operatorName || 'operator'}
          />
        </div>
      )}

      {/* TAB CONTENT: TRAVELER CHAT (bidirectional, visible to traveler) */}
      {activeTab === 'traveler_chat' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Traveler Chat</h3>
              <p className="text-xs text-neutral-400">Visible to traveler — separate from internal notes. Enabled after traveler confirmation + operator approval/acceptance.</p>
            </div>
          </div>
          <TravelerChatPanel
            key={`traveler-chat-${trip.id}`}
            tripId={trip.id}
            tripTitle={trip.title}
            destinationName={trip.destination?.name}
            travelerName={trip.traveler?.name}
          />
        </div>
      )}

      {/* TAB CONTENT: TRAVELER PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Live Traveler Screen Synchronization</h3>
              <p className="text-xs text-neutral-400">This exact canonical trip state is rendered to the traveler's device.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Linked</span>
            </span>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">Traveler Portal View</span>
                <h4 className="text-lg font-bold text-white">{trip.title}</h4>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-400">Package Total</div>
                <div className="text-sm font-bold text-white font-mono">₹{(trip.total_cost || trip.total_budget || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Notifications shown to traveler */}
            {trip.notifications && trip.notifications.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-400">Traveler Notifications:</div>
                {trip.notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-0.5">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-neutral-500">{new Date(n.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-neutral-300 text-[11px]">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
