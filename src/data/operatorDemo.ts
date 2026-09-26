/**
 * Demo fallback entities shared by every Operator-Web page (offline/demo only).
 * Travelers, trips, bookings, hotels and transport use the same IDs/names so
 * navigating between pages stays consistent.
 */
import type { ActivityAssignment, Booking, OpsActivityInventoryItem, OpsProperty, OpsVendorRow, TransportAssignment, Trip } from '../types/tourflow';

export const DEMO_KPIS = {
  active_tours: 3,
  travelers_on_ground: 12,
  today_activities: 9,
  urgent_issues: 1,
  upcoming_trips: 2,
  total_revenue: 423000,
};

export const DEMO_TRIP_IDS = ['TRP-RJ-2041', 'TRP-KR-2042', 'TRP-GOA-2043', 'TRP-RJ-2044'];

export const DEMO_ACTIVE_TOURS_TABLE = [
  { id: 'TRP-RJ-2041', title: 'Rajasthani Getaway', route: 'Jaipur → Jodhpur → Udaipur', travelers: 4, price: 184500, status: 'on_track', has_unresolved_alerts: false },
  { id: 'TRP-KR-2042', title: 'Kerala Backwater Escape', route: 'Kochi → Alleppey → Munnar', travelers: 2, price: 96500, status: 'on_track', has_unresolved_alerts: false },
  { id: 'TRP-GOA-2043', title: 'Goa Coastal Retreat', route: 'Panaji → Baga → Palolem', travelers: 6, price: 142000, status: 'issue', has_unresolved_alerts: true },
];

export const DEMO_PROPERTIES: OpsProperty[] = [
  { id: 'HTL-SAMODE', name: 'Samode Haveli', destination_id: 'DEST-JAIPUR', destination_name: 'Jaipur', address: 'Gangori Bazaar, Jaipur 302002', category: 'heritage-haveli', rating: 4.8, price_per_night: 18500, currency: 'INR', is_active: true, assigned_trip_ids: ['TRP-RJ-2041'], assigned_trip_count: 1 },
  { id: 'HTL-AJITH', name: 'Ajit Bhawan Palace', destination_id: 'DEST-JODHPUR', destination_name: 'Jodhpur', address: 'Circuit House Road, Jodhpur 342006', category: 'palace-resort', rating: 4.7, price_per_night: 16400, currency: 'INR', is_active: true, assigned_trip_ids: ['TRP-RJ-2041'], assigned_trip_count: 1 },
  { id: 'HTL-PICHOLA', name: 'Lake Pichola Heritage Inn', destination_id: 'DEST-UDAIPUR', destination_name: 'Udaipur', address: 'Chand Pole, Udaipur 313001', category: 'lake-hotel', rating: 4.6, price_per_night: 14800, currency: 'INR', is_active: true, assigned_trip_ids: ['TRP-RJ-2041'], assigned_trip_count: 1 },
  { id: 'HTL-BACKWATER', name: 'Alleppey Backwater Houseboats', destination_id: 'DEST-ALLEPPEY', destination_name: 'Alleppey', address: 'Punnamada, Alleppey 688013', category: 'houseboat', rating: 4.5, price_per_night: 12500, currency: 'INR', is_active: true, assigned_trip_ids: ['TRP-KR-2042'], assigned_trip_count: 1 },
  { id: 'HTL-GOABAY', name: 'Goa Bayline Resort', destination_id: 'DEST-BAGA', destination_name: 'Baga', address: "Tito's Lane, Baga 403516", category: 'beach-resort', rating: 4.3, price_per_night: 9800, currency: 'INR', is_active: true, assigned_trip_ids: ['TRP-GOA-2043'], assigned_trip_count: 1 },
];

export function buildDemoTrips(): Trip[] {
  const rows = [
    { id: 'TRP-RJ-2041', title: 'Rajasthani Getaway', traveler: 'Ananya Deshpande', email: 'ananya.deshpande@example.in', phone: '+91 98200 41173', origin: 'Mumbai', dest: 'Jaipur · Jodhpur · Udaipur', state: 'Rajasthan', status: 'ongoing', start: '2026-10-18', end: '2026-10-23', formatted: '18 – 23 Oct 2026', days: 6, travelers: 4, budget: 184500, operator: 'Meera Khandelwal', actionable: true },
    { id: 'TRP-KR-2042', title: 'Kerala Backwater Escape', traveler: 'Rohan Mehta', email: 'rohan.mehta@example.in', phone: '+91 98111 20845', origin: 'Bengaluru', dest: 'Kochi · Alleppey · Munnar', state: 'Kerala', status: 'ongoing', start: '2026-10-20', end: '2026-10-25', formatted: '20 – 25 Oct 2026', days: 6, travelers: 2, budget: 96500, operator: 'Arvind Menon', actionable: true },
    { id: 'TRP-GOA-2043', title: 'Goa Coastal Retreat', traveler: 'Kavya Nair', email: 'kavya.nair@example.in', phone: '+91 97450 66210', origin: 'Delhi', dest: 'Panaji · Baga · Palolem', state: 'Goa', status: 'confirmed', start: '2026-11-02', end: '2026-11-06', formatted: '2 – 6 Nov 2026', days: 5, travelers: 6, budget: 142000, operator: 'Meera Khandelwal', actionable: true },
    { id: 'TRP-RJ-2044', title: 'Jaipur Heritage Weekend', traveler: 'Arjun Malhotra', email: 'arjun.malhotra@example.in', phone: '+91 98990 13457', origin: 'Delhi', dest: 'Jaipur', state: 'Rajasthan', status: 'planning', start: '2026-11-14', end: '2026-11-16', formatted: '14 – 16 Nov 2026', days: 3, travelers: 2, budget: 48500, operator: '', actionable: false },
  ];
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    origin: t.origin,
    start_date: t.start,
    end_date: t.end,
    duration_days: t.days,
    total_budget: t.budget,
    total_cost: t.budget,
    currency: 'INR',
    traveler_count: t.travelers,
    status: t.status,
    formatted_dates: t.formatted,
    destination: { id: `DEST-${t.id}`, name: t.dest, slug: 'india', country: 'India', state_region: t.state, description: `${t.title} across ${t.dest}.`, tags: ['heritage'], is_featured: true, created_at: '2026-09-01T00:00:00Z' },
    traveler: { id: `TRV-${t.id}`, name: t.traveler, email: t.email, phone: t.phone },
    assigned_operator_id: t.operator || undefined,
    operator_actionable: t.actionable,
    itinerary: demoItinerary(t.id),
    bookings: demoBookings(t.id),
    alerts: [],
  } as unknown as Trip));
}

function demoItinerary(tripId: string): Trip['itinerary'] {
  if (tripId === 'TRP-RJ-2041') {
    return [
      { id: 'RJ-D1-A', trip_id: tripId, day_number: 1, order_index: 1, item_type: 'activity', title: 'Amber Fort guided walk', description: 'Amber Fort and Sheesh Mahal with historian.', start_time: '09:00', end_time: '12:30', cost: 2400, location: 'Amber, Jaipur', status: 'confirmed' },
      { id: 'RJ-D1-H', trip_id: tripId, day_number: 1, order_index: 2, item_type: 'hotel', title: 'Check-in · Samode Haveli', description: '2 Heritage Courtyard Rooms, breakfast included.', start_time: '14:00', end_time: '15:00', cost: 18500, location: 'Jaipur', status: 'confirmed' },
      { id: 'RJ-D2-A', trip_id: tripId, day_number: 2, order_index: 1, item_type: 'activity', title: 'Pink City food trail', description: 'Johari and Bapu Bazaar evening trail.', start_time: '17:00', end_time: '20:30', cost: 1800, location: 'Jaipur', status: 'confirmed' },
      { id: 'RJ-D3-T', trip_id: tripId, day_number: 3, order_index: 1, item_type: 'transport', title: 'Jaipur → Jodhpur private cab', description: 'Innova Crysta + Vikram Singh Rathore, NH62.', start_time: '08:00', end_time: '14:00', cost: 9500, location: 'NH62', status: 'confirmed' },
      { id: 'RJ-D4-A', trip_id: tripId, day_number: 4, order_index: 1, item_type: 'activity', title: 'Mehrangarh Fort + Jaswant Thada', description: 'Sunrise fort walk and brunch.', start_time: '08:30', end_time: '12:00', cost: 1500, location: 'Jodhpur', status: 'confirmed' },
      { id: 'RJ-D5-A', trip_id: tripId, day_number: 5, order_index: 1, item_type: 'activity', title: 'Lake Pichola sunset cruise', description: 'Private sunset boat ride.', start_time: '17:30', end_time: '19:30', cost: 3200, location: 'Udaipur', status: 'confirmed' },
    ];
  }
  return [
    { id: `${tripId}-D1`, trip_id: tripId, day_number: 1, order_index: 1, item_type: 'activity', title: 'Arrival + orientation walk', description: 'Welcome briefing with tour captain.', start_time: '10:00', end_time: '12:00', cost: 1200, location: 'City centre', status: 'confirmed' },
  ];
}

function demoBookings(tripId: string): Booking[] {
  if (tripId === 'TRP-RJ-2041') {
    return [
      { id: 'BKG-RJ-8801', trip_id: tripId, booking_reference: 'WAI-RJ-8801', item_type: 'hotel', vendor_id: 'Samode Haveli', amount: 92500, currency: 'INR', status: 'confirmed', payment_status: 'paid', booking_date: '2026-09-18T10:00:00Z' },
      { id: 'BKG-RJ-8802', trip_id: tripId, booking_reference: 'WAI-RJ-8802', item_type: 'transport', vendor_id: 'Marwar Cabs', amount: 38500, currency: 'INR', status: 'confirmed', payment_status: 'paid', booking_date: '2026-09-18T10:05:00Z' },
    ];
  }
  if (tripId === 'TRP-KR-2042') {
    return [
      { id: 'BKG-KR-4401', trip_id: tripId, booking_reference: 'WAI-KR-4401', item_type: 'hotel', vendor_id: 'Alleppey Backwater Houseboats', amount: 62500, currency: 'INR', status: 'confirmed', payment_status: 'paid', booking_date: '2026-09-19T09:00:00Z' },
    ];
  }
  if (tripId === 'TRP-GOA-2043') {
    return [
      { id: 'BKG-GOA-7701', trip_id: tripId, booking_reference: 'WAI-GOA-7701', item_type: 'hotel', vendor_id: 'Goa Bayline Resort', amount: 58800, currency: 'INR', status: 'pending', payment_status: 'pending', booking_date: '2026-09-21T06:30:00Z' },
    ];
  }
  return [];
}

export const DEMO_ACCOMMODATION = [
  { trip_id: 'TRP-RJ-2041', status: 'assigned', rooms: 2, room_type: 'Heritage Courtyard Room', check_in_date: '2026-10-18', check_out_date: '2026-10-20', hotel: { id: 'HTL-SAMODE', name: 'Samode Haveli', address: 'Gangori Bazaar, Jaipur 302002' }, updated_at: '2026-09-20T08:00:00Z' },
  { trip_id: 'TRP-KR-2042', status: 'assigned', rooms: 1, room_type: 'Premium Houseboat (1 bedroom)', check_in_date: '2026-10-21', check_out_date: '2026-10-22', hotel: { id: 'HTL-BACKWATER', name: 'Alleppey Backwater Houseboats', address: 'Punnamada, Alleppey' }, updated_at: '2026-09-20T08:00:00Z' },
  { trip_id: 'TRP-GOA-2043', status: 'pending', rooms: 3, room_type: 'Deluxe Sea-Facing', check_in_date: '2026-11-02', check_out_date: '2026-11-06', hotel: null, updated_at: '2026-09-21T06:30:00Z' },
];

export const DEMO_VEHICLES = [
  { id: 'VEH-INNOVA-21', name: 'Toyota Innova Crysta', registration_number: 'RJ14 TD 4521', vehicle_type: 'private_cab', capacity: 6, is_active: true },
  { id: 'VEH-TEMPO-07', name: 'Force Tempo Traveller 3050', registration_number: 'RJ19 UB 8807', vehicle_type: 'private_cab', capacity: 12, is_active: true },
  { id: 'FLT-6E-221', name: 'IndiGo 6E-221 · BLR → COK', registration_number: 'PNR MJ8Q2R', vehicle_type: 'flight', capacity: 180, is_active: true },
];

export const DEMO_DRIVERS = [
  { id: 'DRV-VIKRAM', name: 'Vikram Singh Rathore', phone: '+91 98290 55412', license_number: 'RJ1420190045211', is_active: true },
  { id: 'DRV-SALIM', name: 'Salim Khan', phone: '+91 94144 78120', license_number: 'RJ1920210077120', is_active: true },
];

export const DEMO_ACTIVITY_INVENTORY: OpsActivityInventoryItem[] = [
  { id: 'ACT-AMBER', title: 'Amber Fort guided walk', category: 'culture', duration_hours: 3.5, price_per_person: 2400, currency: 'INR', rating: 4.8, destination_id: 'DEST-JAIPUR', destination_name: 'Amber, Jaipur', is_active: true },
  { id: 'ACT-FOODTRAIL', title: 'Pink City food trail', category: 'culinary', duration_hours: 3.5, price_per_person: 1800, currency: 'INR', rating: 4.9, destination_id: 'DEST-JAIPUR', destination_name: 'Johari Bazaar, Jaipur', is_active: true },
  { id: 'ACT-CRUISE', title: 'Lake Pichola sunset cruise', category: 'relaxation', duration_hours: 2, price_per_person: 3200, currency: 'INR', rating: 4.7, destination_id: 'DEST-UDAIPUR', destination_name: 'Udaipur', is_active: true },
];

export const DEMO_ACTIVITY_ASSIGNMENTS: ActivityAssignment[] = [
  { id: 'ASG-RJ-01', trip_id: 'TRP-RJ-2041', activity_id: 'ACT-AMBER', vendor_id: 'VND-PINKCITY', scheduled_date: '2026-10-18', start_time: '09:00', end_time: '12:30', participants: 4, status: 'confirmed', activity: { id: 'ACT-AMBER', title: 'Amber Fort guided walk', category: 'culture', duration_hours: 3.5, rating: 4.8, currency: 'INR', destination_id: 'DEST-JAIPUR', is_active: true }, vendor: { id: 'VND-PINKCITY', name: 'Pinkcity Walks', vendor_type: 'activity', phone: '+91 98291 44556', contact_email: 'hello@pinkcitywalks.example', rating: 4.9, is_verified: true }, updated_at: '2026-09-20T08:00:00Z' },
  { id: 'ASG-RJ-02', trip_id: 'TRP-RJ-2041', activity_id: 'ACT-CRUISE', vendor_id: 'VND-LAKEPICHOLA', scheduled_date: '2026-10-22', start_time: '17:30', end_time: '19:30', participants: 4, status: 'confirmed', activity: { id: 'ACT-CRUISE', title: 'Lake Pichola sunset cruise', category: 'relaxation', duration_hours: 2, rating: 4.7, currency: 'INR', destination_id: 'DEST-UDAIPUR', is_active: true }, vendor: { id: 'VND-LAKEPICHOLA', name: 'Lake Pichola Boats', vendor_type: 'activity', phone: '+91 98290 33445', contact_email: 'cruise@lakeboats.example', rating: 4.7, is_verified: true }, updated_at: '2026-09-20T08:00:00Z' },
];

export const DEMO_VENDORS: OpsVendorRow[] = [
  { id: 'VND-SAMODE', name: 'Samode Haveli Reservations', vendor_type: 'hotel', phone: '+91 141 263 2370', contact_email: 'reserve@samodehaveli.example', rating: 4.8, is_verified: true, assigned_trip_ids: ['TRP-RJ-2041'], assigned_trip_count: 1 },
  { id: 'VND-MARWAR', name: 'Marwar Cabs · Jaipur', vendor_type: 'transport', phone: '+91 98290 11223', contact_email: 'dispatch@marwarcabs.example', rating: 4.6, is_verified: true, assigned_trip_ids: ['TRP-RJ-2041'], assigned_trip_count: 1 },
  { id: 'VND-PINKCITY', name: 'Pinkcity Walks', vendor_type: 'activity', phone: '+91 98291 44556', contact_email: 'hello@pinkcitywalks.example', rating: 4.9, is_verified: true, assigned_trip_ids: ['TRP-RJ-2041'], assigned_trip_count: 1 },
];

export const DEMO_TRANSPORT: TransportAssignment[] = [
  { trip_id: 'TRP-RJ-2041', status: 'assigned', origin: 'Jaipur Airport', destination: 'Samode Haveli', pickup_at: '2026-10-18T11:30:00', dropoff_at: '2026-10-18T12:30:00', vehicle: { id: 'VEH-INNOVA-21', name: 'Toyota Innova Crysta', registration_number: 'RJ14 TD 4521', vehicle_type: 'private_cab', capacity: 6 }, driver: { id: 'DRV-VIKRAM', name: 'Vikram Singh Rathore', phone: '+91 98290 55412' }, updated_at: '2026-09-20T08:00:00Z' } as unknown as TransportAssignment,
  { trip_id: 'TRP-KR-2042', status: 'assigned', origin: 'Bengaluru', destination: 'Kochi', pickup_at: '2026-10-20T09:00:00', dropoff_at: '2026-10-20T10:10:00', vehicle: { id: 'FLT-6E-221', name: 'IndiGo 6E-221 · BLR → COK (PNR MJ8Q2R)', registration_number: 'PNR MJ8Q2R', vehicle_type: 'flight', capacity: 180 }, driver: null, updated_at: '2026-09-20T08:00:00Z' } as unknown as TransportAssignment,
];


