import {
  HealthStatus,
  Destination,
  Hotel,
  Activity,
  TransportOption,
  Trip,
  TripPreference,
  AIChatResponse,
  OperatorVendor,
  PossibleOptionItem,
  HotelSearchResponse,
  AccommodationAssignment,
  AccommodationStatus,
  OpsProperty,
  Vehicle,
  Driver,
  TransportAssignment,
  TransportStatus,
  TravelerNotification,
  ActivityAssignment,
  ActivityAssignmentStatus,
  OpsActivityInventoryItem,
  OpsVendorDetail,
  OpsVendorMini,
  OpsVendorRow,
  TripApprovalState,
  TripPipeline,
  TripFinalizeResult,
  TripMessage,
  TripMessageCategory,
  TripMessageOverviewEntry,
  TravelerUser,
  TravelerAuthResponse,
  TravelerTripSummary,
  CreatedTripResult,
  TravelerOperatorChat,
  TravelerOperatorChatMessage,
  TravelerChatOverviewEntry,
} from '../types/tourflow';
import { travelerSession } from './travelerSession';
import { operatorSession } from './operatorSession';

const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
// Frontend-first fix: never build a relative "undefined/..." URL (Vite would
// answer with index.html → "<!doctype ..." JSON SyntaxError). Fall back to the
// local FastAPI base so the browser always calls the actual backend API.
export const API_BASE = (RAW_API_BASE ? RAW_API_BASE.replace(/\/+$/, '') : '') || 'http://localhost:8000/api';

/** Parse JSON only when the backend actually returned JSON. HTML (e.g. the
 * Vite SPA fallback) becomes a clear error instead of a raw SyntaxError. */
async function parseJsonSafe<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  const looksJson = contentType.includes('application/json') || /^[\s]*[{[]/.test(text);
  if (!looksJson) {
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 120);
    throw new Error(
      `Expected JSON from ${res.url} but received ${contentType || 'unknown content-type'} (status ${res.status}): ${snippet || '(empty response)'}`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 120);
    throw new Error(`Invalid JSON from ${res.url} (status ${res.status}): ${snippet}`);
  }
}
export const TourFlowApi = {
  /** Last HTTP status seen on a traveler auth check (lets the auth store
   * distinguish an explicit 401 rejection from a network failure). */
  lastAuthStatus: 0 as number,
  /** Wired by the traveler auth store; invoked on 401s from traveler APIs. /
  onUnauthorized: null as null | (() => void),

  /** Authorization header for the logged-in traveler, if any. */
  authHeaders(): Record<string, string> {
    const token = travelerSession.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /** Last HTTP status seen on an operator API check (lets the portal
   * distinguish an explicit 401 rejection from a network failure). */
  lastOpsAuthStatus: 0 as number,

  /** Authorization header for the logged-in operator, if any. */
  operatorHeaders(): Record<string, string> {
    const token = operatorSession.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Traveler password authentication (FastAPI owns sessions; only the JWT is
  // kept client-side — never passwords).
  async travelerSignup(fullName: string, email: string, password: string): Promise<TravelerAuthResponse> {
    const res = await fetch(`${API_BASE}/auth/traveler/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Signup failed' }));
      throw new Error(err.detail || 'Signup failed');
    }
    return await parseJsonSafe(res);
  },

  async travelerLogin(email: string, password: string): Promise<TravelerAuthResponse> {
    const res = await fetch(`${API_BASE}/auth/traveler/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return await parseJsonSafe(res);
  },

  async getTravelerMe(): Promise<TravelerUser> {
    const res = await fetch(`${API_BASE}/auth/traveler/me`, {
      headers: { ...this.authHeaders() },
    });
    this.lastAuthStatus = res.status;
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Session invalid' }));
      throw new Error(err.detail || 'Session invalid');
    }
    return await parseJsonSafe(res);
  },

  /** Traveler-scoped request: 401s surface session expiry exactly once. */
  async travelerFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...this.authHeaders(), ...(init?.headers || {}) },
    });
    if (res.status === 401) {
      this.lastAuthStatus = 401;
     
      const err = await res.json().catch(() => ({ detail: 'Session expired. Please sign in again.' }));
      throw new Error(err.detail || 'Session expired. Please sign in again.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'Request failed');
    }
    return await parseJsonSafe<T>(res);
  },

  // Persistent "My Trips" (PostgreSQL snapshots; canonical trip store).
  getMyTrips(): Promise<TravelerTripSummary[]> {
    return TourFlowApi.travelerFetch<TravelerTripSummary[]>('/traveler/trips');
  },

  getMyTrip(tripId: string): Promise<Trip> {
    return TourFlowApi.travelerFetch<Trip>(`/traveler/trips/${encodeURIComponent(tripId)}`);
  },

  saveMyTrip(trip: Trip): Promise<{ trip_id: string; owned: boolean; updated: boolean }> {
    return TourFlowApi.travelerFetch('/traveler/trips', {
      method: 'POST',
      body: JSON.stringify({ trip_id: trip.id, trip }),
    });
  },

  /** Rehydrate the Express engine from a persisted snapshot (no regeneration). */
  async restoreTrip(trip: Trip): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Could not open trip' }));
      throw new Error(err.detail || 'Could not open trip');
    }
    return await parseJsonSafe(res);
  },

  // Health & Diagnostics
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status ${res.status}`);
    }
    return await parseJsonSafe(res);
  },

  // Destinations
  async getDestinations(featuredOnly = false): Promise<Destination[]> {
    const url = featuredOnly ? `${API_BASE}/destinations?featured_only=true` : `${API_BASE}/destinations`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<Destination[]>(res);
    } catch {
      return [];
    }
  },

  async getDestinationById(idOrSlug: string): Promise<Destination> {
    const res = await fetch(`${API_BASE}/destinations/${idOrSlug}`);
    if (!res.ok) {
      throw new Error(`Destination not found: ${idOrSlug}`);
    }
    return await parseJsonSafe(res);
  },

  // Catalog items
  async getHotels(destinationId?: string, category?: string): Promise<Hotel[]> {
    const params = new URLSearchParams();
    if (destinationId) params.set('destination_id', destinationId);
    if (category) params.set('category', category);
    const res = await fetch(`${API_BASE}/hotels?${params.toString()}`);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<Hotel[]>(res);
    } catch {
      return [];
    }
  },

  async getActivities(destinationId?: string, category?: string): Promise<Activity[]> {
    const params = new URLSearchParams();
    if (destinationId) params.set('destination_id', destinationId);
    if (category) params.set('category', category);
    const res = await fetch(`${API_BASE}/activities?${params.toString()}`);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<Activity[]>(res);
    } catch {
      return [];
    }
  },

  async getTransport(destinationId?: string, type?: string): Promise<TransportOption[]> {
    const params = new URLSearchParams();
    if (destinationId) params.set('destination_id', destinationId);
    if (type) params.set('type', type);
    const res = await fetch(`${API_BASE}/transport?${params.toString()}`);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<TransportOption[]>(res);
    } catch {
      return [];
    }
  },

  // Trips (Central Entity)
  async createTrip(payload: {
    title?: string;
    destination_name?: string;
    destination_id?: string;
    destination?: Destination;
    duration_days?: number;
    total_budget?: number;
    traveler_count?: number;
    travel_type?: 'solo' | 'couple' | 'family' | 'friends';
    origin?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    formatted_dates?: string | null;
    pace?: 'relaxed' | 'balanced' | 'packed';
    preferences?: Partial<TripPreference>;
  }): Promise<CreatedTripResult> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create trip' }));
      throw new Error(err.detail || 'Failed to create trip');
    }
    const trip: CreatedTripResult = await parseJsonSafe(res);
    // Authenticated travelers get the complete trip persisted to their
    // account automatically (best-effort: creation itself already succeeded).
    if (travelerSession.getToken()) {
      try {
        await this.saveMyTrip(trip);
        trip.persistedToAccount = true;
      } catch (err) {
        trip.persistedToAccount = false;
        console.warn('Trip created but could not be saved to My Trips yet:', err);
      }
    }
    return trip;
  },

  async changeTransport(tripId: string, transportId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/change-transport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transport_id: transportId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update transport' }));
      throw new Error(err.detail || 'Failed to update transport');
    }
    return await parseJsonSafe(res);
  },

  async changeAccommodation(tripId: string, accommodationId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/change-accommodation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accommodation_id: accommodationId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update accommodation' }));
      throw new Error(err.detail || 'Failed to update accommodation');
    }
    return await parseJsonSafe(res);
  },

  async changeDailyAccommodation(tripId: string, dayNumber: number, accommodationId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/change-daily-accommodation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_number: dayNumber, accommodation_id: accommodationId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update day accommodation' }));
      throw new Error(err.detail || 'Failed to update day accommodation');
    }
    return await parseJsonSafe(res);
  },

  async getTrip(tripId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Trip not found' }));
      throw new Error(err.detail || `Trip not found with id: ${tripId}`);
    }
    return await parseJsonSafe(res);
  },

  async confirmTrip(tripId: string, userId?: string): Promise<{
    success: boolean; already_confirmed: boolean; confirmed_at?: string | null; trip: Trip;
  }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId ? { user_id: userId } : {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to confirm trip' }));
      throw new Error(err.detail || 'Failed to confirm trip');
    }
    return await parseJsonSafe(res);
  },

  async updateTrip(tripId: string, payload: Partial<Trip>): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update trip' }));
      throw new Error(err.detail || 'Failed to update trip');
    }
    return await parseJsonSafe(res);
  },

  async getTripPreferences(tripId: string): Promise<TripPreference> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/preferences`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Preferences not found' }));
      throw new Error(err.detail || 'Failed to get trip preferences');
    }
    return await parseJsonSafe(res);
  },

  async updateTripPreferences(tripId: string, preferences: Partial<TripPreference>): Promise<TripPreference> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update preferences' }));
      throw new Error(err.detail || 'Failed to update trip preferences');
    }
    return await parseJsonSafe(res);
  },

  async getTrips(filters?: { status?: string; search?: string; operator_id?: string }): Promise<Trip[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.operator_id) params.append('operator_id', filters.operator_id);
      const res = await fetch(`${API_BASE}/trips?${params.toString()}`);
      if (res.ok) return await parseJsonSafe(res);
    } catch {
      // Return empty array on network or server failure
    }
    return [];
  },

  async triggerDisruption(tripId: string): Promise<{ success: boolean; trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/trigger-disruption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to trigger disruption' }));
      throw new Error(err.detail || 'Failed to trigger disruption');
    }
    return await parseJsonSafe(res);
  },

  async getImpactAnalysis(tripId: string, disruption?: any): Promise<any> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/impact-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruption }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to compute impact analysis' }));
      throw new Error(err.detail || 'Failed to compute impact analysis');
    }
    return await parseJsonSafe(res);
  },

  async getAiReplanOptions(tripId: string, disruption?: any): Promise<any> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/ai-replan-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruption }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch replan alternatives' }));
      throw new Error(err.detail || 'Failed to fetch replan alternatives');
    }
    return await parseJsonSafe(res);
  },

  async applyReplan(tripId: string, alternativeId: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/apply-replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alternative_id: alternativeId, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to apply replan' }));
      throw new Error(err.detail || 'Failed to apply replan');
    }
    return await parseJsonSafe(res);
  },

  /** @deprecated Operator Accept & Assign runs through the secure operator
   * pipeline (approveTrip + acceptTripAssignment with the operator JWT).
   * Legacy /trips/{id}/accept-request flips traveler status without auth
   * and is never used by the portal. */
  async acceptTripRequest(_tripId: string): Promise<never> {
    throw new Error('acceptTripRequest is retired: use approveTrip + acceptTripAssignment (traveler-confirmed trips only)');
  },

  async declineTripRequest(tripId: string): Promise<any> {
    // Decline stays on the legacy traveler-request route (no Trip row may
    // exist yet); operator pipeline trips are cancelled via status flows.
    const res = await fetch(`${API_BASE}/trips/${tripId}/decline-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.operatorHeaders() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to decline trip request' }));
      throw new Error(err.detail || 'Failed to decline trip request');
    }
    return await parseJsonSafe(res);
  },

  async getOperatorDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/operator/dashboard`);
    if (!res.ok) {
      return null;
    }
    try {
      return await parseJsonSafe(res);
    } catch {
      return null;
    }
  },

  async getOperatorVendors(): Promise<OperatorVendor[]> {
    const res = await fetch(`${API_BASE}/operator/vendors`);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<OperatorVendor[]>(res);
    } catch {
      return [];
    }
  },

  async toggleVendor(vendorId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/operator/vendors/${vendorId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to toggle vendor status' }));
      throw new Error(err.detail || 'Failed to toggle vendor status');
    }
    return await parseJsonSafe(res);
  },

  async getOperatorBookings(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/operator/bookings`);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<any[]>(res);
    } catch {
      return [];
    }
  },

  // Read-only booking readiness. Creating a reservation remains an explicit trip action.
  async getBookingRecommendations(tripId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/bookings/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to get booking recommendations' }));
      throw new Error(err.detail || 'Failed to get booking recommendations');
    }
    return await parseJsonSafe(res);
  },

  async chatWithAssistant(tripId: string, message: string): Promise<any> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId, message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Assistant request failed' }));
      throw new Error(err.detail || 'Assistant request failed');
    }
    return await parseJsonSafe(res);
  },

  async updateBookingAction(bookingId: string, action: 'confirm' | 'cancel' | 'rebook'): Promise<any> {
    const res = await fetch(`${API_BASE}/operator/bookings/${bookingId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update booking' }));
      throw new Error(err.detail || 'Failed to update booking');
    }
    return await parseJsonSafe(res);
  },

  async getOperatorAlerts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/operator/alerts`);
    if (!res.ok) {
      return [];
    }
    try {
      return await parseJsonSafe<any[]>(res);
    } catch {
      return [];
    }
  },

  async resolveAlert(alertId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/operator/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to resolve alert' }));
      throw new Error(err.detail || 'Failed to resolve alert');
    }
    return await parseJsonSafe(res);
  },

  async getOperatorAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/operator/analytics`);
    if (!res.ok) {
      return null;
    }
    try {
      return await parseJsonSafe(res);
    } catch {
      return null;
    }
  },

  async getSyncVersion(): Promise<{ version: number; timestamp: string; trips_count: number }> {
    const res = await fetch(`${API_BASE}/sync/version`);
    if (!res.ok) {
      return { version: 0, timestamp: new Date().toISOString(), trips_count: 0 };
    }
    try {
      return await parseJsonSafe<{ version: number; timestamp: string; trips_count: number }>(res);
    } catch {
      return { version: 0, timestamp: new Date().toISOString(), trips_count: 0 };
    }
  },

  async operatorLogin(email: string, password: string): Promise<{ success: boolean; user: any; token?: string; detail?: string }> {
    const res = await fetch(`${API_BASE}/auth/operator-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Invalid operator credentials');
    }
    const body = await parseJsonSafe<{ success: boolean; user: any; token?: string }>(res);
    // Persist the verified operator JWT (never the password) so trip and
    // operations calls can prove operator authorization to the backend.
    if (body?.success && body?.user && body?.token) {
      operatorSession.set({ token: body.token, user: body.user });
    }
    return body;
  },

  operatorLogout(): void {
    operatorSession.clear();
  },

  async operatorAiAssistant(message: string, contextTripId?: string): Promise<{ reply: string; timestamp: string; suggested_actions: string[] }> {
    const res = await fetch(`${API_BASE}/operator/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, trip_id: contextTripId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'AI Operations Assistant error' }));
      throw new Error(err.detail || 'AI Operations Assistant error');
    }
    return await parseJsonSafe(res);
  },

  // AI Services
  async aiChat(
    message: string, 
    context?: Record<string, any>, 
    currentTrip?: Trip | null,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIChatResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        session_context: context, 
        current_trip: currentTrip,
        history: history || []
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to process AI chat message' }));
      throw new Error(err.detail || 'Failed to process AI chat message');
    }
    return await parseJsonSafe(res);
  },

  async aiExtractPreferences(textPrompt: string): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/ai/extract-preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_prompt: textPrompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to extract preferences' }));
      throw new Error(err.detail || 'Failed to extract preferences');
    }
    return await parseJsonSafe(res);
  },

  async aiReplan(tripId: string, triggerEvent: { type: string; severity: string; title: string; description: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId, trigger_event: triggerEvent }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate replan' }));
      throw new Error(err.detail || 'Failed to generate replan');
    }
    return await parseJsonSafe(res);
  },

  // Itinerary Activity Real-Time Modification Handlers
  async addItineraryActivity(tripId: string, activityData: {
    day_number: number;
    title: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    cost?: number;
    location?: string;
    item_type?: string;
    image_url?: string;
    duration?: string;
    walking_intensity?: 'none' | 'light' | 'moderate' | 'high';
    rest_buffer_minutes?: number;
  }): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/add-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add itinerary activity' }));
      throw new Error(err.detail || 'Failed to add itinerary activity');
    }
    return await parseJsonSafe(res);
  },

  async deleteItineraryActivity(tripId: string, itemId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/delete-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete itinerary activity' }));
      throw new Error(err.detail || 'Failed to delete itinerary activity');
    }
    return await parseJsonSafe(res);
  },

  async deleteItineraryItem(tripId: string, itemId: string): Promise<Trip> {
    return await this.deleteItineraryActivity(tripId, itemId);
  },

    async deleteTrip(tripId: string): Promise<{ success: boolean; message?: string }> {    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      if (res.status === 404) return { success: true };
      const err = await res.json().catch(() => ({ detail: 'Failed to delete trip' }));
      throw new Error(err.detail || 'Failed to delete trip');
    }
    return await parseJsonSafe(res);
  },

  async deleteItinerary(itineraryId: string): Promise<{ success: boolean; message?: string }> {
    return await this.deleteTrip(itineraryId);
  },

  async swapItineraryActivity(tripId: string, params: {
    item_id: string;
    new_title: string;
    new_description?: string;
    new_cost?: number;
    new_image_url?: string;
  }): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/swap-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to swap itinerary activity' }));
      throw new Error(err.detail || 'Failed to swap itinerary activity');
    }
    return await parseJsonSafe(res);
  },

  async editItineraryActivity(tripId: string, params: {
    item_id: string;
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    cost?: number;
  }): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/edit-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to edit itinerary activity' }));
      throw new Error(err.detail || 'Failed to edit itinerary activity');
    }
    return await parseJsonSafe(res);
  },

  async getPossibleOptions(destName: string, tripId?: string): Promise<PossibleOptionItem[]> {
    try {
      const q = new URLSearchParams({ destination: destName });
      if (tripId) q.append('trip_id', tripId);
      const res = await fetch(`${API_BASE}/possible-options?${q.toString()}`);
      if (res.ok) return await parseJsonSafe(res);
    } catch {
      // return empty array on failure
    }
    return [];
  },

  async toggleItineraryActivity(tripId: string, itemId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/toggle-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to toggle itinerary activity' }));
      throw new Error(err.detail || 'Failed to toggle itinerary activity');
    }
    return await parseJsonSafe(res);
  },

  async addDayLeg(tripId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/add-day-leg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add day leg' }));
      throw new Error(err.detail || 'Failed to add day leg');
    }
    return await parseJsonSafe(res);
  },

  async removeDayLeg(tripId: string, dayNumber: number): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/remove-day-leg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_number: dayNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to remove day leg' }));
      throw new Error(err.detail || 'Failed to remove day leg');
    }
    return await parseJsonSafe(res);
  },

  async changeTripTransport(tripId: string, transportId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/change-transport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transport_id: transportId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to change transport' }));
      throw new Error(err.detail || 'Failed to change transport');
    }
    return await parseJsonSafe(res);
  },

  async changeTripAccommodation(tripId: string, accommodationId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/change-accommodation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accommodation_id: accommodationId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to change accommodation' }));
      throw new Error(err.detail || 'Failed to change accommodation');
    }
    return await parseJsonSafe(res);
  },

  // Live hotel search (SerpApi via backend; the key never reaches the browser).
  async searchHotels(params: {
    destination: string;
    check_in_date: string;
    check_out_date: string;
    adults?: number;
    children?: number;
    currency?: string;
    gl?: string;
    hl?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
  }): Promise<HotelSearchResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    const res = await fetch(`${API_BASE}/hotels/search?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Hotel search failed' }));
      throw new Error(err.detail || 'Hotel search failed');
    }
    return await parseJsonSafe(res);
  },

  // Live place photos (SerpApi Google Images via backend; key never reaches browser).
  async getPlaceImages(params: {
    location: string;
    destination?: string;
    count?: number;
  }): Promise<{ location: string; image_url: string | null; images: string[]; source: string }> {
    const query = new URLSearchParams();
    query.set('location', params.location);
    if (params.destination) query.set('destination', params.destination);
    if (params.count) query.set('count', String(params.count));
    const res = await fetch(`${API_BASE}/places/image?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Place image lookup failed' }));
      throw new Error(err.detail || 'Place image lookup failed');
    }
    return await parseJsonSafe(res);
  },

  // ---- Operations consoles (canonical state in FastAPI + database) ----
  async _ops<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...this.operatorHeaders() },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    this.lastOpsAuthStatus = res.status;
    if (res.status === 401) {
      // Operator session rejected: drop it so the portal returns to login
      // instead of retrying with a dead token.
      operatorSession.clear();
      const err = await res.json().catch(() => ({ detail: 'Operator session expired. Please sign in again.' }));
      throw new Error(err.detail || 'Operator session expired. Please sign in again.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `Operations request failed (${res.status})` }));
      throw new Error(err.detail || `Operations request failed (${res.status})`);
    }
    return await parseJsonSafe<T>(res);
  },

  // Canonical traveler trips for operators (secure backend /ops/trips —
  // same Trip rows the Traveler app creates; requires operator session).
  async getOperatorTrips(filters?: { status?: string; search?: string }): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return this._ops('GET', `/ops/trips${suffix}`);
  },

  async getOperatorTrip(tripId: string): Promise<Trip> {
    return this._ops('GET', `/ops/trips/${encodeURIComponent(tripId)}`);
  },

  // Accommodation operations
  getAccommodationAssignments(status?: AccommodationStatus): Promise<AccommodationAssignment[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this._ops('GET', `/ops/accommodations${q}`);
  },
  getAccommodationAssignment(tripId: string): Promise<AccommodationAssignment> {
    return this._ops('GET', `/ops/accommodations/${encodeURIComponent(tripId)}`);
  },
  assignAccommodation(payload: {
    trip_id: string; hotel_id?: string | null; rooms?: number | null;
    room_type?: string | null; check_in_date?: string | null; check_out_date?: string | null;
  }): Promise<AccommodationAssignment> {
    return this._ops('POST', '/ops/accommodations', payload);
  },
  changeAccommodationAssignment(tripId: string, payload: {
    hotel_id?: string | null; rooms?: number | null;
    room_type?: string | null; check_in_date?: string | null; check_out_date?: string | null;
  }): Promise<AccommodationAssignment> {
    return this._ops('PUT', `/ops/accommodations/${encodeURIComponent(tripId)}`, payload);
  },
  updateRoomAllocation(tripId: string, payload: {
    rooms?: number | null; room_type?: string | null;
  }): Promise<AccommodationAssignment> {
    return this._ops('PUT', `/ops/accommodations/${encodeURIComponent(tripId)}/rooms`, payload);
  },
  flagAccommodationIssue(tripId: string, reason: string): Promise<AccommodationAssignment> {
    return this._ops('POST', `/ops/accommodations/${encodeURIComponent(tripId)}/flag-issue`, { reason });
  },
  resolveAccommodationIssue(tripId: string): Promise<AccommodationAssignment> {
    return this._ops('POST', `/ops/accommodations/${encodeURIComponent(tripId)}/resolve-issue`, {});
  },
  getProperties(): Promise<OpsProperty[]> {
    return this._ops('GET', '/ops/properties');
  },
  getPropertyTrips(hotelId: string): Promise<{ hotel: { id: string; name: string; address?: string | null }; assignments: AccommodationAssignment[] }> {
    return this._ops('GET', `/ops/properties/${encodeURIComponent(hotelId)}/trips`);
  },

  // Fleet inventory
  getVehicles(): Promise<Vehicle[]> {
    return this._ops('GET', '/ops/vehicles');
  },
  createVehicle(payload: { name: string; registration_number: string; vehicle_type?: string; capacity?: number }): Promise<Vehicle> {
    return this._ops('POST', '/ops/vehicles', payload);
  },
  getDrivers(): Promise<Driver[]> {
    return this._ops('GET', '/ops/drivers');
  },
  createDriver(payload: { name: string; phone?: string; license_number?: string }): Promise<Driver> {
    return this._ops('POST', '/ops/drivers', payload);
  },

  // Transport operations
  getTransportAssignments(status?: TransportStatus): Promise<TransportAssignment[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this._ops('GET', `/ops/transport${q}`);
  },
  getTransportAssignment(tripId: string): Promise<TransportAssignment> {
    return this._ops('GET', `/ops/transport/${encodeURIComponent(tripId)}`);
  },
  assignTransport(payload: {
    trip_id: string; vehicle_id?: string | null; driver_id?: string | null;
    origin?: string | null; destination?: string | null;
    pickup_at?: string | null; dropoff_at?: string | null;
  }): Promise<TransportAssignment> {
    return this._ops('POST', '/ops/transport', payload);
  },
  changeTransportAssignment(tripId: string, payload: {
    vehicle_id?: string | null; driver_id?: string | null;
    origin?: string | null; destination?: string | null;
    pickup_at?: string | null; dropoff_at?: string | null;
  }): Promise<TransportAssignment> {
    return this._ops('PUT', `/ops/transport/${encodeURIComponent(tripId)}`, payload);
  },
  updateJourneyTiming(tripId: string, payload: {
    pickup_at?: string | null; dropoff_at?: string | null;
    origin?: string | null; destination?: string | null;
  }): Promise<TransportAssignment> {
    return this._ops('PUT', `/ops/transport/${encodeURIComponent(tripId)}/timing`, payload);
  },
  setTransportStatus(tripId: string, to_status: TransportStatus, delay_reason?: string): Promise<TransportAssignment> {
    return this._ops('POST', `/ops/transport/${encodeURIComponent(tripId)}/status`, { to_status, delay_reason });
  },
  notifyTraveler(tripId: string, event: string, note?: string): Promise<TravelerNotification> {
    return this._ops('POST', `/ops/transport/${encodeURIComponent(tripId)}/notify`, { event, note });
  },

  // Activity dispatch operations
  getActivityAssignments(filters?: {
    trip_id?: string; status?: ActivityAssignmentStatus; vendor_id?: string; scheduled_date?: string;
  }): Promise<ActivityAssignment[]> {
    const q = new URLSearchParams();
    if (filters?.trip_id) q.set('trip_id', filters.trip_id);
    if (filters?.status) q.set('status', filters.status);
    if (filters?.vendor_id) q.set('vendor_id', filters.vendor_id);
    if (filters?.scheduled_date) q.set('scheduled_date', filters.scheduled_date);
    const suffix = q.toString() ? `?${q.toString()}` : '';
    return this._ops('GET', `/ops/activities${suffix}`);
  },
  getActivityAssignment(assignmentId: string): Promise<ActivityAssignment> {
    return this._ops('GET', `/ops/activities/${encodeURIComponent(assignmentId)}`);
  },
  assignActivity(payload: {
    trip_id: string; activity_id: string; vendor_id?: string | null;
    scheduled_date?: string | null; start_time?: string | null; end_time?: string | null;
    participants?: number | null;
  }): Promise<ActivityAssignment> {
    return this._ops('POST', '/ops/activities', payload);
  },
  changeActivityAssignment(assignmentId: string, payload: {
    activity_id?: string | null; vendor_id?: string | null; vendor_cleared?: boolean;
    scheduled_date?: string | null; start_time?: string | null; end_time?: string | null;
    participants?: number | null;
  }): Promise<ActivityAssignment> {
    return this._ops('PUT', `/ops/activities/${encodeURIComponent(assignmentId)}`, payload);
  },
  updateActivityAllocation(assignmentId: string, participants?: number | null): Promise<ActivityAssignment> {
    return this._ops('PUT', `/ops/activities/${encodeURIComponent(assignmentId)}/allocation`, { participants });
  },
  confirmActivityAssignment(assignmentId: string): Promise<ActivityAssignment> {
    return this._ops('POST', `/ops/activities/${encodeURIComponent(assignmentId)}/confirm`, {});
  },
  flagActivityIssue(assignmentId: string, reason: string): Promise<ActivityAssignment> {
    return this._ops('POST', `/ops/activities/${encodeURIComponent(assignmentId)}/flag-issue`, { reason });
  },
  resolveActivityIssue(assignmentId: string): Promise<ActivityAssignment> {
    return this._ops('POST', `/ops/activities/${encodeURIComponent(assignmentId)}/resolve-issue`, {});
  },
  getEligibleVendors(activityId: string): Promise<{ activity: { id: string; title: string; capacity?: number | null }; vendors: OpsVendorMini[] }> {
    return this._ops('GET', `/ops/activity-inventory/${encodeURIComponent(activityId)}/vendors`);
  },
  onboardVendor(payload: { name: string; vendor_type?: string; contact_email?: string; phone?: string }): Promise<OpsVendorMini> {
    return this._ops('POST', '/ops/vendors', payload);
  },
  getVendorAssignments(vendorId: string): Promise<OpsVendorDetail> {
    return this._ops('GET', `/ops/vendors/${encodeURIComponent(vendorId)}/assignments`);
  },

  // Operator approval pipeline (traveler-confirmed -> approved -> accepted -> finalized)
  getTripApprovals(): Promise<TripApprovalState[]> {
    return this._ops('GET', '/ops/approvals');
  },
  getTripPipeline(tripId: string): Promise<TripPipeline> {
    return this._ops('GET', `/ops/trips/${encodeURIComponent(tripId)}/pipeline`);
  },
  approveTrip(tripId: string): Promise<TripApprovalState> {
    return this._ops('POST', `/ops/trips/${encodeURIComponent(tripId)}/approve`, {});
  },
  acceptTripAssignment(tripId: string): Promise<TripApprovalState> {
    return this._ops('POST', `/ops/trips/${encodeURIComponent(tripId)}/accept`, {});
  },
  finalizeTrip(tripId: string, requireActivities = true): Promise<TripFinalizeResult> {
    return this._ops('POST', `/ops/trips/${encodeURIComponent(tripId)}/finalize`, { require_activities: requireActivities });
  },
  postOperatorNote(tripId: string, payload: { title: string; message: string; type?: string }): Promise<any> {
    return this._ops('POST', `/trips/${encodeURIComponent(tripId)}/operator-note`, payload);
  },
  getOpsVendors(vendorType?: string): Promise<OpsVendorRow[]> {
    const q = vendorType ? `?vendor_type=${encodeURIComponent(vendorType)}` : '';
    return this._ops('GET', `/ops/vendors${q}`);
  },
  setVendorVerified(vendorId: string, is_verified: boolean): Promise<OpsVendorRow> {
    return this._ops('POST', `/ops/vendors/${encodeURIComponent(vendorId)}/verify`, { is_verified });
  },
  getActivityInventory(destinationId?: string): Promise<OpsActivityInventoryItem[]> {
    const q = destinationId ? `?destination_id=${encodeURIComponent(destinationId)}` : '';
    return this._ops('GET', `/ops/activity-inventory${q}`);
  },

  // Internal trip communications (operator-only; never traveler-facing)
  getTripMessagesOverview(): Promise<TripMessageOverviewEntry[]> {
    return this._ops('GET', '/ops/messages/overview');
  },
  getTripMessages(tripId: string, category?: TripMessageCategory): Promise<TripMessage[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return this._ops('GET', `/ops/trips/${encodeURIComponent(tripId)}/messages${q}`);
  },
  createTripMessage(tripId: string, payload: {
    operator_name?: string; category?: TripMessageCategory; body: string; is_urgent?: boolean;
  }): Promise<TripMessage> {
    return this._ops('POST', `/ops/trips/${encodeURIComponent(tripId)}/messages`, {
      trip_id: tripId,
      ...payload,
    });
  },

  // Traveler <-> operator chat (bidirectional, traveler-visible).
  // Separate domain from internal TripMessage notes: different table and
  // different endpoints. The backend decides `enabled`/`status` from the
  // canonical traveler-confirmed -> approved -> accepted pipeline; the
  // frontend only renders what the backend reports.
  getTripChat(tripId: string): Promise<TravelerOperatorChat> {
    return this._ops('GET', `/ops/trips/${encodeURIComponent(tripId)}/chat`);
  },
  getTripChatOverview(): Promise<TravelerChatOverviewEntry[]> {
    return this._ops('GET', '/ops/chats/overview');
  },
  initializeTripChat(tripId: string): Promise<TravelerOperatorChat> {
    return this._ops('POST', `/ops/trips/${encodeURIComponent(tripId)}/chat`, {});
  },
  sendTripChatMessage(tripId: string, body: string): Promise<TravelerOperatorChatMessage> {
    // Only the plain-text body is sent. sender_type/sender_id are derived
    // server-side from the operator JWT — never trust client-supplied IDs.
    return this._ops('POST', `/ops/trips/${encodeURIComponent(tripId)}/chat/messages`, {
      body,
    });
  },

  // Live restaurant search (SerpApi Google Maps via backend; key never reaches browser).
  async searchRestaurants(params: {    destination: string;
    meal_type?: 'breakfast' | 'brunch' | 'lunch' | 'dinner';
    cuisine?: string;
    latitude?: number;
    longitude?: number;
    min_rating?: number;
    max_results?: number;
  }): Promise<{ destination: string; meal_type?: string | null; cuisine?: string | null; results: any[]; source: string }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    const res = await fetch(`${API_BASE}/restaurants/search?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Restaurant search failed' }));
      throw new Error(err.detail || 'Restaurant search failed');
    }
    return await parseJsonSafe(res);
  },

  // Persist a traveler-selected live hotel against the trip itinerary.
  async selectHotel(tripId: string, selection: {
    day_number?: number;
    property_token?: string | null;
    name: string;
    location?: string | null;
    image_url?: string | null;
    description?: string | null;
    price_per_night?: number | null;
    total_price?: number | null;
    currency?: string;
    rating?: number | null;
    hotel_class?: number | null;
    amenities?: string[];
    check_in_date?: string | null;
    check_out_date?: string | null;
  }): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/select-hotel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selection),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to save hotel selection' }));
      throw new Error(err.detail || 'Failed to save hotel selection');
    }
    return await parseJsonSafe(res);
  },

  async changeDayAccommodation(tripId: string, dayNumber: number, accommodationId: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/change-day-accommodation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_number: dayNumber, accommodation_id: accommodationId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to change day accommodation' }));
      throw new Error(err.detail || 'Failed to change day accommodation');
    }
    return await parseJsonSafe(res);
  },

  // Lock Booking Choice
  async lockBookingChoice(tripId: string, params: {
    item_type: string;
    item_id?: string;
    booking_mode: 'ai_guide' | 'self_booking';
    details: {
      title: string;
      amount: number;
      provider?: string;
      external_url?: string;
    };
  }): Promise<{ success: boolean; booking: any; trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/lock-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to lock in booking choice' }));
      throw new Error(err.detail || 'Failed to lock in booking choice');
    }
    return await parseJsonSafe(res);
  },

  // User Abstract Preferences Storage Logic
  getUserPreferences(): { tags: string[]; updated_at: string } | null {
    try {
      const raw = localStorage.getItem('user_preferences');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  },

  saveAbstractUserPreferences(tags: string[]): void {
    try {
      if (!tags || tags.length === 0) return;
      const existing = TourFlowApi.getUserPreferences()?.tags || [];
      const combined = Array.from(new Set([...existing, ...tags]));
      localStorage.setItem(
        'user_preferences',
        JSON.stringify({ tags: combined, updated_at: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  },

  clearActiveSession(): void {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
  },
};
