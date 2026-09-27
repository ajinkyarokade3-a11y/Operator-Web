import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TourFlowApi } from './api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TourFlowApi.getTripSocialSignals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the correct endpoint with the trip ID', async () => {
    const mockResponse = { available: false };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    await TourFlowApi.getTripSocialSignals('trip-123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trips/trip-123/social-signals'),
    );
  });

  it('encodes the trip ID in the URL', async () => {
    const mockResponse = { available: false };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    await TourFlowApi.getTripSocialSignals('trip/123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/trips/trip%2F123/social-signals'),
    );
  });

  it('returns the response on success', async () => {
    const mockResponse = {
      available: true,
      signals: [{ title: 'Test', severity: 'medium' }],
      overall_risk: 'medium',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    });

    const result = await TourFlowApi.getTripSocialSignals('trip-123');
    expect(result).toEqual(mockResponse);
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Social signals unavailable' }),
      text: async () => JSON.stringify({ detail: 'Social signals unavailable' }),
    });

    await expect(TourFlowApi.getTripSocialSignals('trip-123')).rejects.toThrow('Social signals unavailable');
  });

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Trip not found' }),
      text: async () => JSON.stringify({ detail: 'Trip not found' }),
    });

    await expect(TourFlowApi.getTripSocialSignals('nonexistent')).rejects.toThrow('Trip not found');
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(TourFlowApi.getTripSocialSignals('trip-123')).rejects.toThrow();
  });
});
