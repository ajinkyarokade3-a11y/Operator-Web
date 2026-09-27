import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TourFlowApi } from './api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TourFlowApi.simulateTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the simulate endpoint with the correct trip ID', async () => {
    const mockResponse = {
      trip_id: 'trip-123',
      weather_context: { available: true },
      affected_items: [],
      dependencies: [],
      conflicts: [],
      replanning_required: false,
      simulation_timestamp: '2026-09-27T10:00:00+00:00',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    await TourFlowApi.simulateTrip('trip-123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trips/trip-123/simulate'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends scenario override when provided', async () => {
    const mockResponse = {
      trip_id: 'trip-123',
      weather_context: { available: true },
      scenario: 'severe',
      affected_items: [],
      dependencies: [],
      conflicts: [],
      replanning_required: true,
      simulation_timestamp: '2026-09-27T10:00:00+00:00',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    await TourFlowApi.simulateTrip('trip-123', 'severe');

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body).toEqual({ scenario: 'severe' });
  });

  it('sends empty body when no scenario provided', async () => {
    const mockResponse = {
      trip_id: 'trip-123',
      weather_context: {},
      affected_items: [],
      dependencies: [],
      conflicts: [],
      replanning_required: false,
      simulation_timestamp: '2026-09-27T10:00:00+00:00',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    await TourFlowApi.simulateTrip('trip-123');

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body).toEqual({});
  });

  it('encodes the trip ID in the URL', async () => {
    const mockResponse = {
      trip_id: 'trip/123',
      weather_context: {},
      affected_items: [],
      dependencies: [],
      conflicts: [],
      replanning_required: false,
      simulation_timestamp: '2026-09-27T10:00:00+00:00',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    await TourFlowApi.simulateTrip('trip/123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trips/trip%2F123/simulate'),
      expect.anything(),
    );
  });

  it('returns the full simulation response', async () => {
    const mockResponse = {
      trip_id: 'trip-123',
      weather_context: { available: true, current: { severity: 'high' } },
      scenario: 'heavy_rain',
      affected_items: [
        {
          item_id: 'item-1',
          day_number: 1,
          order_index: 1,
          item_type: 'transport',
          title: 'Airport Transfer',
          reason: 'Heavy rain may delay transport',
          severity: 'high',
          estimated_delay_minutes: 45,
        },
      ],
      dependencies: [],
      conflicts: [],
      replanning_required: true,
      simulation_timestamp: '2026-09-27T10:00:00+00:00',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    const result = await TourFlowApi.simulateTrip('trip-123', 'heavy_rain');
    expect(result).toEqual(mockResponse);
    expect(result.affected_items).toHaveLength(1);
    expect(result.replanning_required).toBe(true);
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Simulation failed' }),
      text: async () => JSON.stringify({ detail: 'Simulation failed' }),
    });

    await expect(TourFlowApi.simulateTrip('trip-123')).rejects.toThrow('Simulation failed');
  });

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Trip not found' }),
      text: async () => JSON.stringify({ detail: 'Trip not found' }),
    });

    await expect(TourFlowApi.simulateTrip('nonexistent')).rejects.toThrow('Trip not found');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(TourFlowApi.simulateTrip('trip-123')).rejects.toThrow();
  });
});
