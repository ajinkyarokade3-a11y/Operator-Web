import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TourFlowApi } from './api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TourFlowApi.getTripWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the trip-specific weather endpoint with the correct trip ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ available: true }),
      text: async () => JSON.stringify({ available: true }),
    });

    await TourFlowApi.getTripWeather('trip-123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trips/trip-123/weather'),
    );
  });

  it('encodes the trip ID in the URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ available: false }),
      text: async () => JSON.stringify({ available: false }),
    });

    await TourFlowApi.getTripWeather('trip/123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trips/trip%2F123/weather'),
    );
  });

  it('returns the response on success', async () => {
    const mockResponse = {
      available: true,
      location: { latitude: 32.2, longitude: 77.1 },
      current: { temperature: 20 },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    const result = await TourFlowApi.getTripWeather('trip-123');
    expect(result).toEqual(mockResponse);
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Weather provider unavailable' }),
      text: async () => JSON.stringify({ detail: 'Weather provider unavailable' }),
    });

    await expect(TourFlowApi.getTripWeather('trip-123')).rejects.toThrow('Weather provider unavailable');
  });

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Trip not found' }),
      text: async () => JSON.stringify({ detail: 'Trip not found' }),
    });

    await expect(TourFlowApi.getTripWeather('nonexistent')).rejects.toThrow('Trip not found');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(TourFlowApi.getTripWeather('trip-123')).rejects.toThrow();
  });
});
