import React from 'react';
import { Users, MapPin, AlertTriangle, DollarSign, ShieldAlert, Sparkles, ChevronRight, UserCheck, XCircle, ArrowRight } from 'lucide-react';
import { Trip, TripApprovalState } from '../../../types/tourflow';

interface Props {
  kpis: { active_tours: number; travelers_on_ground: number; today_activities: number; urgent_issues: number; upcoming_trips: number; total_revenue: number };
  priorityAlerts: any[];
  activeTours: any[];
  allTrips: Trip[];
  approvals: TripApprovalState[];
  onSelectTrip: (tripId: string) => void;
  onTriggerDisruptionDemo: () => void;
  onAcceptTripRequest: (tripId: string) => void;
  onDeclineTripRequest: (tripId: string) => void;
  onOpenReplanForTrip: (tripId: string) => void;
  onOpenAssignmentCenter: (tripId: string) => void;
}

export const OperatorDashboard: React.FC<Props> = ({ kpis, priorityAlerts, activeTours, allTrips, approvals, onSelectTrip, onTriggerDisruptionDemo, onAcceptTripRequest, onDeclineTripRequest, onOpenReplanForTrip, onOpenAssignmentCenter }) => {
  const pendingRequests = allTrips.filter(t => t.status === 'planning');
  const finalizedIds = new Set((approvals || []).filter(a => a.finalized).map(a => a.trip_id));
  const incomingConfirmed = allTrips.filter(t => t.status === 'confirmed' && !finalizedIds.has(t.id));
  const kpiItems = [
    { label: 'Active Tours', value: kpis.active_tours, sub: 'across 4 sectors', icon: MapPin, tint: 'var(--color-accent)' },
    { label: 'Travelers', value: `${kpis.travelers_on_ground} Pax`, sub: 'verified partners', icon: Users, tint: 'var(--color-accent)' },
    { label: 'Urgent', value: kpis.urgent_issues, sub: kpis.urgent_issues ? 'needs replan' : 'all clear', icon: AlertTriangle, tint: 'var(--color-accent)' },
    { label: 'Volume', value: `₹${kpis.total_revenue.toLocaleString()}`, sub: 'partner payments', icon: DollarSign, tint: 'var(--color-accent)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Operations Command</h1>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', border: '1px solid var(--color-accent-border)' }}>Live Dispatch</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>Real-time tours, vendor allotments & traveler safety.</p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600 }}>Live Operations</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {kpiItems.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-subtle)', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 999, background: `${k.tint}14`, filter: 'blur(6px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{k.label}</span>
                <span style={{ width: 32, height: 32, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${k.tint}18`, color: k.tint, border: `1px solid ${k.tint}30` }}><Icon size={16} /></span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{k.value as any}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{k.sub}</div>
            </div>
          );
        })}
      </div>
      {priorityAlerts.length > 0 && (
        <div style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}><ShieldAlert size={18} /></span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Critical Incident - Tour #{priorityAlerts[0].trip_id}</div>
              <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>{priorityAlerts[0].title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, maxWidth: 560 }}>{priorityAlerts[0].description}</div>
            </div>
          </div>
          <button id="btn-open-replan-alert-banner" onClick={() => onOpenReplanForTrip(priorityAlerts[0].trip_id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'var(--color-accent)', color: 'var(--color-text-inverse)', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
            <Sparkles size={14} /> Launch Replan <ArrowRight size={14} />
          </button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {pendingRequests.length > 0 && (
          <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-accent)', display: 'inline-block' }} /> Booking Requests - {pendingRequests.length}</span>
              <span style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700 }}>Pending allotment</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pendingRequests.slice(0, 5).map(req => (
                <div key={req.id} style={{ padding: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>#{req.id}</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 13 }}>{req.title}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>{req.formatted_dates}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{req.origin} to {req.destination?.name} - {req.traveler_count} pax - ₹{(req.total_budget || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button id={`btn-accept-request-${req.id}`} onClick={() => onAcceptTripRequest(req.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'var(--color-accent)', color: 'var(--color-text-inverse)', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}><UserCheck size={14} /> Accept</button>
                    <button id={`btn-review-request-${req.id}`} onClick={() => onSelectTrip(req.id)} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Review</button>
                    <button id={`btn-decline-request-${req.id}`} onClick={() => onDeclineTripRequest(req.id)} style={{ width: 32, height: 32, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {incomingConfirmed.length > 0 && (
          <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-accent)', display: 'inline-block' }} /> Confirmed - {incomingConfirmed.length}</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: 'var(--color-accent-soft)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}>Operator action required</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {incomingConfirmed.slice(0, 4).map(trip => (
                <div key={trip.id} style={{ padding: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent)', fontWeight: 700 }}>#{trip.id}</span><span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 13 }}>{trip.title}</span></div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{trip.destination?.name} - {trip.start_date?.slice(0, 10)} to {trip.end_date?.slice(0, 10)} - {trip.traveler_count} pax</div>
                  </div>
                  <button onClick={() => onOpenAssignmentCenter(trip.id)} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-surface-elevated)', color: '#fff', fontWeight: 600, fontSize: 12, border: '1px solid var(--color-border)', cursor: 'pointer' }}>Review →</button>
                </div>
              ))}
            </div>
           </div>
        )}
      </div>
      <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>Active Tours</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>PostgreSQL synced records</div></div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>Total {activeTours.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ background: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase', fontSize: 10, letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-muted)' }}>
              <tr><th style={{ textAlign: 'left', padding: '10px 16px' }}>Tour</th><th style={{ textAlign: 'left', padding: '10px 16px' }}>Route</th><th style={{ textAlign: 'left', padding: '10px 16px' }}>Pax</th><th style={{ textAlign: 'left', padding: '10px 16px' }}>Value</th><th style={{ textAlign: 'left', padding: '10px 16px' }}>Status</th><th style={{ textAlign: 'right', padding: '10px 16px' }}></th></tr>
            </thead>
            <tbody>
              {activeTours.map((tour: any) => {
                const isIssue = tour.status === 'issue' || tour.has_unresolved_alerts;
                return (
                  <tr key={tour.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{tour.title}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>#{tour.id}</div></td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{tour.route}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{tour.travelers} Pax</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{tour.price?.toLocaleString?.()}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 999, border: '1px solid var(--color-accent-border)', background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>{isIssue ? 'Urgent' : 'On Track'}</span></td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}><button id={`btn-open-workspace-${tour.id}`} onClick={() => onSelectTrip(tour.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Open <ChevronRight size={14} /></button></td>
                  </tr>
                );
              })}
              {activeTours.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>No active tours</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
