import React, { useState, useEffect, useCallback } from 'react';
import { OperatorLogin } from './OperatorLogin';
import { OperatorHeader } from '../components/layout/OperatorHeader';
import { OperatorSidebar, OperatorNavTab } from '../components/layout/OperatorSidebar';
import { OperatorDashboard } from '../components/operator/dashboard/OperatorDashboard';
import { OperatorTripWorkspace } from '../components/operator/dashboard/OperatorTripWorkspace';
import { OperatorTripRequests } from '../components/operator/dashboard/OperatorTripRequests';
import { OperatorItineraries } from '../components/operator/itinerary/OperatorItineraries';
import { OperatorHotels } from '../components/operator/hotels/OperatorHotels';
import { OperatorTransport } from '../components/operator/transport/OperatorTransport';
import { OperatorVendors } from '../components/operator/vendors/OperatorVendors';
import { OperatorAssignmentFlow } from '../components/operator/dashboard/OperatorAssignmentFlow';
import { OperatorBookings } from '../components/operator/bookings/OperatorBookings';
import { OperatorAlerts } from '../components/operator/alerts/OperatorAlerts';
import { OperatorCommunications } from '../components/operator/communications/OperatorCommunications';
import { OperatorAiAssistant } from '../components/operator/ai/OperatorAiAssistant';
import { OperatorAnalytics } from '../components/operator/analytics/OperatorAnalytics';
import { TourFlowApi } from '../services/api';
import type { Trip, TripApprovalState } from '../types/tourflow';

export const OperatorPortal: React.FC<{ onSwitchToTraveler: () => void }> = ({ onSwitchToTraveler }) => {
  const [operatorUser, setOperatorUser] = useState<{ email: string; name: string; role: string; operator_name: string } | null>(() => {
    const s = localStorage.getItem('tourflow_operator_user');
    if (s) try { return JSON.parse(s); } catch { return null; }
    return { email: 'operator@tourflow.ai', name: 'Rajesh Sharma', role: 'operator', operator_name: 'Himalayan Trails Tour Operations' };
  });
  const [currentTab, setCurrentTab] = useState<OperatorNavTab>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [focusOpsTripId, setFocusOpsTripId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<TripApprovalState[]>([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [lastVersion, setLastVersion] = useState(0);

  const fetchAllData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [dash, tripsList, bkgs, alrts, analytics] = await Promise.all([TourFlowApi.getOperatorDashboard(), TourFlowApi.getTrips(), TourFlowApi.getOperatorBookings(), TourFlowApi.getOperatorAlerts(), TourFlowApi.getOperatorAnalytics()]);
      if (dash) setDashboardData(dash); if (tripsList) setAllTrips(tripsList); if (bkgs) setBookings(bkgs); if (alrts) setAlerts(alrts); if (analytics) setAnalyticsData(analytics);
      if (selectedTripId) { const t = await TourFlowApi.getTrip(selectedTripId); if (t) setSelectedTrip(t); }
      setLastSyncTime(new Date());
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  }, [selectedTripId]);

  useEffect(() => { if (operatorUser) fetchAllData(); }, [operatorUser, fetchAllData]);
  useEffect(() => { if (!operatorUser) return; const id = setInterval(async () => { try { const m = await TourFlowApi.getSyncVersion(); if (m.version !== lastVersion) { setLastVersion(m.version); fetchAllData(); } } catch {} }, 3000); return () => clearInterval(id); }, [operatorUser, lastVersion, fetchAllData]);
  useEffect(() => { if (!operatorUser) return; let c = false; const load = async () => { try { const r = await TourFlowApi.getTripApprovals(); if (!c) setApprovals(r || []); } catch {} }; load(); const id = setInterval(load, 30000); return () => { c = true; clearInterval(id); }; }, [operatorUser]);
  useEffect(() => { if (selectedTripId) TourFlowApi.getTrip(selectedTripId).then(t => t && setSelectedTrip(t)); else setSelectedTrip(null); }, [selectedTripId]);

  if (!operatorUser) return <OperatorLogin onLoginSuccess={u => { localStorage.setItem('tourflow_operator_user', JSON.stringify(u)); setOperatorUser(u); }} onSwitchToTraveler={onSwitchToTraveler} />;

  const unresolvedAlertCount = alerts.filter(a => !a.is_resolved).length;
  const isActiveTour = (t: Trip) => {
    if (t.id === 'trp-manali-alpine-demo-001') return false;
    if (t.status === 'ongoing') return true;
    if (t.status !== 'confirmed') return false;
    const a = approvals.find(x => x.trip_id === t.id); return Boolean(a?.finalized);
  };
  const activeToursCount = allTrips.filter(isActiveTour).length;
  const pendingRequestsCount = allTrips.filter(t => t.status === 'planning').length;

  return (
    <div className="app-layout-root" style={{ height: '100vh', overflow: 'hidden', background: 'radial-gradient(900px 500px at 20% -10%, rgba(6,182,212,0.08), transparent 60%), radial-gradient(700px 400px at 90% 0%, rgba(139,92,246,0.07), transparent 60%), var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      <OperatorHeader operatorUser={operatorUser} isSyncing={isSyncing} lastSyncTime={lastSyncTime} onManualSync={fetchAllData} onTriggerDisruptionDemo={async () => { try { const r = await TourFlowApi.triggerDisruption('1024'); if (r?.trip) { setSelectedTripId('1024'); setSelectedTrip(r.trip); fetchAllData(); } } catch {} }} onSwitchToTraveler={onSwitchToTraveler} onLogout={() => { localStorage.removeItem('tourflow_operator_user'); setOperatorUser(null); }} unresolvedAlertCount={unresolvedAlertCount} />
      <div className="app-layout" style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', minHeight: 0 }}>
        <OperatorSidebar currentTab={currentTab} onSelectTab={t => { setCurrentTab(t); setSelectedTripId(null); }} unresolvedAlertCount={unresolvedAlertCount} activeToursCount={activeToursCount} pendingRequestsCount={pendingRequestsCount} />
        <main className="main-content" style={{ flex: 1, height: '100%', overflowY: 'auto', minWidth: 0, padding: '20px 20px 32px', maxWidth: '100%' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            {selectedTrip ? (
              <OperatorTripWorkspace trip={selectedTrip} onBack={() => { setSelectedTripId(null); setSelectedTrip(null); }} onTripUpdated={u => { setSelectedTrip(u); fetchAllData(); }} onTriggerDisruptionDemo={async () => { try { const r = await TourFlowApi.triggerDisruption('1024'); if (r?.trip) { setSelectedTripId('1024'); setSelectedTrip(r.trip); fetchAllData(); } } catch {} }} operatorName={operatorUser.name} />
            ) : (
              <>
                {currentTab === 'dashboard' && <OperatorDashboard kpis={dashboardData?.kpis || { active_tours: 4, travelers_on_ground: 22, today_activities: 14, urgent_issues: unresolvedAlertCount, upcoming_trips: pendingRequestsCount, total_revenue: 943400 }} priorityAlerts={dashboardData?.priority_alerts || []} activeTours={dashboardData?.active_tours_table || []} allTrips={allTrips} approvals={approvals} onSelectTrip={id => setSelectedTripId(id)} onTriggerDisruptionDemo={async () => { try { const r = await TourFlowApi.triggerDisruption('1024'); if (r?.trip) { setSelectedTripId('1024'); setSelectedTrip(r.trip); fetchAllData(); } } catch {} }} onAcceptTripRequest={async id => { await TourFlowApi.acceptTripRequest(id); fetchAllData(); }} onDeclineTripRequest={async id => { await TourFlowApi.declineTripRequest(id); fetchAllData(); }} onOpenReplanForTrip={id => setSelectedTripId(id)} onOpenAssignmentCenter={id => { setFocusOpsTripId(id); setCurrentTab('assignment_center'); }} />}
                {currentTab === 'trip_requests' && <OperatorTripRequests trips={allTrips} onSelectTrip={id => setSelectedTripId(id)} onAcceptTripRequest={async id => { await TourFlowApi.acceptTripRequest(id); fetchAllData(); }} onDeclineTripRequest={async id => { await TourFlowApi.declineTripRequest(id); fetchAllData(); }} />}
                {currentTab === 'active_tours' && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>Active Tours</h1><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>{allTrips.filter(isActiveTour).map(t => (<div key={t.id} style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 10 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>#{t.id}</span><span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: t.status === 'ongoing' ? 'var(--color-success-soft)' : 'var(--color-info-soft)', color: t.status === 'ongoing' ? 'var(--color-success)' : 'var(--color-info)', border: '1px solid ' + (t.status === 'ongoing' ? 'var(--color-success-border)' : 'var(--color-info-border)') }}>{t.status}</span></div><div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{t.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.origin} → {t.destination?.name} · {t.formatted_dates}</div><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>₹{(t.total_cost || t.total_budget || 0).toLocaleString()}</span><button id={`btn-manage-tour-${t.id}`} onClick={() => setSelectedTripId(t.id)} style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--color-surface-elevated)', color: '#fff', fontWeight: 600, fontSize: 12, border: '1px solid var(--color-border)', cursor: 'pointer' }}>Open</button></div></div>))}</div></div>}
                {currentTab === 'itineraries' && <OperatorItineraries trips={allTrips} onSelectTrip={id => setSelectedTripId(id)} onOpenReplanForTrip={id => setSelectedTripId(id)} />}
                {currentTab === 'bookings' && <OperatorBookings bookings={bookings} onBookingAction={async (id, a) => { await TourFlowApi.updateBookingAction(id, a); fetchAllData(); }} onSelectTrip={id => setSelectedTripId(id)} />}
                {currentTab === 'hotels' && <OperatorHotels trips={allTrips} onSelectTrip={id => setSelectedTripId(id)} focusTripId={focusOpsTripId} onClearFocus={() => setFocusOpsTripId(null)} />}
                {currentTab === 'transport' && <OperatorTransport trips={allTrips} onSelectTrip={id => setSelectedTripId(id)} focusTripId={focusOpsTripId} onClearFocus={() => setFocusOpsTripId(null)} />}
                {currentTab === 'vendors' && <OperatorVendors trips={allTrips} onSelectTrip={id => setSelectedTripId(id)} focusTripId={focusOpsTripId} onClearFocus={() => setFocusOpsTripId(null)} />}
                {currentTab === 'assignment_center' && (focusOpsTripId && allTrips.some(t => t.id === focusOpsTripId) ? <OperatorAssignmentFlow trip={allTrips.find(t => t.id === focusOpsTripId) as Trip} onNavigateService={t => setCurrentTab(t)} onPipelineChange={async () => setApprovals((await TourFlowApi.getTripApprovals()) || [])} /> : <div style={{ padding: 32, textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>No Trip Selected — open a confirmed trip from Dashboard.</div>)}
                {currentTab === 'alerts' && <OperatorAlerts alerts={alerts} onResolveAlert={async id => { await TourFlowApi.resolveAlert(id); fetchAllData(); }} onSelectTrip={id => setSelectedTripId(id)} />}
                {currentTab === 'communications' && <OperatorCommunications trips={allTrips} operatorName={operatorUser.name} onSelectTrip={id => setSelectedTripId(id)} />}
                {currentTab === 'ai_assistant' && <OperatorAiAssistant trips={allTrips} onSelectTrip={id => setSelectedTripId(id)} />}
                {currentTab === 'analytics' && <OperatorAnalytics analyticsData={analyticsData} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
