import React, { useCallback, useMemo } from 'react';
import AnimatedList from '../ui/AnimatedList';
import { 
  LayoutDashboard, 
  Inbox,
  Map, 
  CalendarRange,
  Ticket, 
  Building2, 
  Car,
  Compass,
  AlertTriangle, 
  Sparkles,
  Layers,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

export type OperatorNavTab = 
  | 'dashboard' 
  | 'trip_requests'
  | 'active_tours' 
  | 'itineraries'
  | 'bookings' 
  | 'hotels'
  | 'transport'
  | 'vendors' 
  | 'assignment_center'
  | 'alerts' 
  | 'communications';

interface OperatorSidebarProps {
  currentTab: OperatorNavTab;
  onSelectTab: (tab: OperatorNavTab) => void;
  unresolvedAlertCount: number;
  activeToursCount: number;
  pendingRequestsCount: number;
}

export const OperatorSidebar: React.FC<OperatorSidebarProps> = ({
  currentTab,
  onSelectTab,
  unresolvedAlertCount,
  activeToursCount,
  pendingRequestsCount,
}) => {
  // Memoized so AnimatedList (effects keyed on `items`/`onItemSelect`) does not
  // re-subscribe on every parent render. Same items, same behavior.
  const navItems = useMemo(() => [
    {
      id: 'dashboard' as OperatorNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'trip_requests' as OperatorNavTab,
      label: 'Trip Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} new` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold',
    },
    {
      id: 'active_tours' as OperatorNavTab,
      label: 'Active Tours',
      icon: Map,
      badge: activeToursCount > 0 ? `${activeToursCount}` : undefined,
      badgeColor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
    },
    {
      id: 'itineraries' as OperatorNavTab,
      label: 'Itineraries',
      icon: CalendarRange,
    },
    {
      id: 'bookings' as OperatorNavTab,
      label: 'Bookings',
      icon: Ticket,
    },
    {
      id: 'hotels' as OperatorNavTab,
      label: 'Hotels & Resorts',
      icon: Building2,
    },
    {
      id: 'transport' as OperatorNavTab,
      label: 'Transport',
      icon: Car,
    },
    {
      id: 'vendors' as OperatorNavTab,
      label: 'Activities & Vendors',
      icon: Compass,
    },
    {
      id: 'assignment_center' as OperatorNavTab,
      label: 'Assignment Center',
      icon: Layers,
    },
    {
      id: 'alerts' as OperatorNavTab,
      label: 'Alerts',
      icon: AlertTriangle,
      badge: unresolvedAlertCount > 0 ? `${unresolvedAlertCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
    },
    {
      id: 'communications' as OperatorNavTab,
      label: 'Communications',
      icon: MessageSquare,
    },
  ], [unresolvedAlertCount, activeToursCount, pendingRequestsCount]);

  const handleItemSelect = useCallback((item: any) => onSelectTab(item.id), [onSelectTab]);

  return (
    <aside className="sidebar w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', height: '100%', overflow: 'hidden' }}>
      <div className="space-y-4" style={{ flexShrink: 0 }}>
        {/* Operations Hub Info Card */}
        <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Active Agency
          </div>
          <div className="font-bold text-white text-sm flex items-center justify-between">
            <span>Himalayan Trails Ltd.</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Direct dispatch authority for Himachal, Ladakh & Kashmir sectors.
          </p>
        </div>
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3">
          Operations Menu
        </div>
      </div>

      {/* Animated scrollable navigation */}
      <div style={{ flex: 1, minHeight: 0, marginTop: 8, marginBottom: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AnimatedList
          items={navItems}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          className="sidebar-animated-list"
          onItemSelect={handleItemSelect}
          renderItem={(item: any) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          }}
        />
      </div>

      {/* Footer Support Widget */}
      <div className="pt-4 border-t border-neutral-800/80 space-y-3">
        <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-400">
          <div className="flex items-center space-x-2 text-neutral-300 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>Gemini Ops Engine</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Automated impact analysis & high-confidence alternative scoring active.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
          <span>TourFlow Core v2.4</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>PostgreSQL Active</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
