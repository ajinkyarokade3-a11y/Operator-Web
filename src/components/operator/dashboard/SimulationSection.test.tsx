import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SimulationSection } from './SimulationSection';

const { mockSimulateTrip } = vi.hoisted(() => ({
  mockSimulateTrip: vi.fn(),
}));

vi.mock('../../../services/api', () => ({
  TourFlowApi: {
    simulateTrip: mockSimulateTrip,
  },
}));

const mockSimulationResult = {
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
    {
      item_id: 'item-2',
      day_number: 1,
      order_index: 2,
      item_type: 'activity',
      title: 'Sightseeing Tour',
      reason: 'Outdoor activity affected by heavy rain',
      severity: 'moderate',
      estimated_delay_minutes: null,
    },
  ],
  dependencies: [
    {
      source_item_id: 'item-1',
      source_title: 'Airport Transfer',
      target_item_id: 'item-2',
      target_title: 'Sightseeing Tour',
      dependency_type: 'cascading_delay',
      description: 'Transport delay may affect sightseeing time',
    },
  ],
  conflicts: [
    {
      item_id: 'item-3',
      item_title: 'Restaurant Booking',
      conflict_type: 'timing_overlap',
      description: 'Weather delay may cause overlap with restaurant reservation',
      severity: 'moderate',
    },
  ],
  replanning_required: true,
  simulation_timestamp: '2026-09-27T10:00:00+00:00',
};

describe('SimulationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the simulation section with safety notice', () => {
    render(<SimulationSection tripId="trip-123" />);
    expect(screen.getByText('Trip Simulation / What-if')).toBeInTheDocument();
    expect(screen.getByText(/what-if simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/will not be changed/i)).toBeInTheDocument();
  });

  it('renders scenario selector buttons', () => {
    render(<SimulationSection tripId="trip-123" />);
    expect(screen.getByText('Current Weather')).toBeInTheDocument();
    expect(screen.getByText('Heavy Rain')).toBeInTheDocument();
    expect(screen.getByText('High Wind')).toBeInTheDocument();
    expect(screen.getByText('Severe Weather')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('runs simulation with no scenario override by default', async () => {
    mockSimulateTrip.mockResolvedValue(mockSimulationResult);

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('2 items affected');
    expect(mockSimulateTrip).toHaveBeenCalledWith('trip-123', undefined);
  });

  it('runs simulation with selected scenario', async () => {
    mockSimulateTrip.mockResolvedValue(mockSimulationResult);

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Heavy Rain'));
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('2 items affected');
    expect(mockSimulateTrip).toHaveBeenCalledWith('trip-123', 'heavy_rain');
  });

  it('renders affected items', async () => {
    mockSimulateTrip.mockResolvedValue(mockSimulationResult);

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('2 items affected');
    expect(screen.getAllByText('Airport Transfer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sightseeing Tour').length).toBeGreaterThan(0);
    expect(screen.getByText('Heavy rain may delay transport')).toBeInTheDocument();
    expect(screen.getByText('Est. delay: 45 min')).toBeInTheDocument();
  });

  it('renders dependency chains', async () => {
    mockSimulateTrip.mockResolvedValue(mockSimulationResult);

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Dependency Chain');
    expect(screen.getAllByText('Airport Transfer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sightseeing Tour').length).toBeGreaterThan(0);
    expect(screen.getByText('Transport delay may affect sightseeing time')).toBeInTheDocument();
  });

  it('renders conflicts', async () => {
    mockSimulateTrip.mockResolvedValue(mockSimulationResult);

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Conflicts');
    expect(screen.getByText('Restaurant Booking')).toBeInTheDocument();
    expect(screen.getByText('Weather delay may cause overlap with restaurant reservation')).toBeInTheDocument();
  });

  it('renders replanning required state', async () => {
    mockSimulateTrip.mockResolvedValue(mockSimulationResult);

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Replanning Required');
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders no-impact simulation', async () => {
    mockSimulateTrip.mockResolvedValue({
      trip_id: 'trip-123',
      weather_context: { available: true, current: { severity: 'low' } },
      affected_items: [],
      dependencies: [],
      conflicts: [],
      replanning_required: false,
      simulation_timestamp: '2026-09-27T10:00:00+00:00',
    });

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Replanning Required');
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockSimulateTrip.mockRejectedValue(new Error('Network error'));

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Network error');
  });

  it('disables button while loading', async () => {
    let resolvePromise: (value: unknown) => void;
    mockSimulateTrip.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; }),
    );

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    expect(screen.getByText('Running...')).toBeInTheDocument();

    resolvePromise!(mockSimulationResult);
    await screen.findByText('2 items affected');
  });

  it('prevents duplicate requests while loading', async () => {
    let resolvePromise: (value: unknown) => void;
    mockSimulateTrip.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; }),
    );

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    const button = screen.getByText('Running...');
    fireEvent.click(button);

    expect(mockSimulateTrip).toHaveBeenCalledTimes(1);

    resolvePromise!(mockSimulationResult);
    await screen.findByText('2 items affected');
  });

  it('shows trip not found message for 404', async () => {
    mockSimulateTrip.mockRejectedValue(new Error('Trip not found'));

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Trip could not be found. Please refresh the trip and try again.');
  });

  it('shows service not found message for 404 Not Found', async () => {
    mockSimulateTrip.mockRejectedValue(new Error('Not Found'));

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Simulation service not found. Please ensure the backend is up to date.');
  });

  it('shows unauthorized message for 401', async () => {
    mockSimulateTrip.mockRejectedValue(new Error('Unauthorized'));

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('You are not authorized to simulate this trip.');
  });

  it('shows unavailable message for 502', async () => {
    mockSimulateTrip.mockRejectedValue(new Error('502 Bad Gateway'));

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Simulation service is temporarily unavailable.');
  });

  it('shows timeout message for timeout errors', async () => {
    mockSimulateTrip.mockRejectedValue(new Error('Request timed out'));

    render(<SimulationSection tripId="trip-123" />);
    fireEvent.click(screen.getByText('Run Simulation'));

    await screen.findByText('Simulation request timed out. Please try again.');
  });
});
