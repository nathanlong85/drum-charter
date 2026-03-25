import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SongChart } from '@/lib/types/groove';
import { LiveModeView } from '../LiveModeView';

// Mock components
vi.mock('../../groove/GrooveGridEditor', () => ({
  GrooveGridEditor: () => <div data-testid="mock-grid-editor" />,
}));

vi.mock('../RemoteControlSettings', () => ({
  RemoteControlSettings: () => <div data-testid="mock-remote-settings" />,
}));

// Mock hook
vi.mock('@/lib/hooks/useRemoteControl', () => ({
  useRemoteControl: vi.fn().mockReturnValue({
    isListeningForMap: null,
    lastEventMsg: '',
    midiSupported: true,
    midiConnected: true,
    listenForMap: vi.fn(),
    cancelListen: vi.fn(),
    resetConfig: vi.fn(),
    getMappingForAction: vi.fn().mockReturnValue({ keyboard: ['f'], midi: [] }),
  }),
}));

const mockChart: SongChart = {
  id: 'test-chart',
  header: {
    title: 'Test Song',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    metronomeEnabled: false,
    metronomeVolume: 0.5,
  },
  sections: [
    {
      id: 's1',
      name: 'Verse',
      measuresCount: 8,
      notes: ['Keep it steady'],
      subSections: [
        {
          id: 'ss1',
          name: 'Fill',
          measuresCount: 1,
        },
      ],
    },
    {
      id: 's2',
      name: 'Chorus',
      measuresCount: 16,
    },
  ],
  tags: [],
  isPublic: false,
  createdAt: null,
  updatedAt: null,
};

describe('LiveModeView', () => {
  const mockOnExit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header with chart title', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);
    expect(screen.getByTestId('live-mode-header')).toBeInTheDocument();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
  });

  it('displays correct navigation labels based on section index', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    // At first section (index 0)
    const prevBtn = screen.getByTestId('live-mode-prev-btn');
    expect(prevBtn).toHaveTextContent(/TOP/i);
    expect(prevBtn).toHaveTextContent(/PREVIOUS/i);

    const nextBtn = screen.getByTestId('live-mode-next-btn');
    expect(nextBtn).toHaveTextContent(/Chorus/i);
    expect(nextBtn).toHaveTextContent(/NEXT/i);

    // Navigate to last section (index 1)
    fireEvent.click(nextBtn);

    expect(screen.getByTestId('live-mode-prev-btn')).toHaveTextContent(/Verse/i);
    expect(screen.getByTestId('live-mode-next-btn')).toHaveTextContent(/FINISH/i);
  });

  it('renders the active section name and measure count', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    expect(screen.getByText('Verse')).toBeDefined();
    expect(screen.getByTestId('section-measures-count')).toHaveTextContent('8 Measures');
  });

  it('renders the "Next Up" preview when not on the last section', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    const nextPreview = screen.getByTestId('next-section-preview');
    expect(nextPreview).toHaveTextContent(/Up Next/i);
    expect(nextPreview).toHaveTextContent(/Chorus/i);
  });

  it('hides the "Next Up" preview on the last section', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    const nextBtn = screen.getByTestId('live-mode-next-btn');
    fireEvent.click(nextBtn);

    expect(screen.getByText('Chorus')).toBeDefined();
    expect(screen.queryByTestId('next-section-preview')).toBeNull();
  });

  it('navigates to next section on button click', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    // Assert initial active section is Verse
    expect(screen.getByTestId('active-section-name')).toHaveTextContent('Verse');
    // Chorus should only be in the preview initially
    expect(screen.queryByTestId('active-section-name')).not.toHaveTextContent('Chorus');

    const nextBtn = screen.getByRole('button', { name: /NEXT/i });
    fireEvent.click(nextBtn);

    // Now Chorus should be active
    expect(screen.getByTestId('active-section-name')).toHaveTextContent('Chorus');
  });

  it('renders sub-section measure counts prominently', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    expect(screen.getByText('Fill')).toBeDefined();
    expect(screen.getByTestId('subsection-measures-ss1')).toHaveTextContent('1M');
  });

  it('calls onExit when exit button is clicked', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    const exitBtn = screen.getByTestId('exit-live-mode-btn');
    fireEvent.click(exitBtn);

    expect(mockOnExit).toHaveBeenCalled();
  });

  it('displays the dynamic shortcut for fullscreen', () => {
    render(<LiveModeView chart={mockChart} onExit={mockOnExit} />);

    expect(screen.getByText(/Fullscreen \(F\)/i)).toBeDefined();
  });
});
