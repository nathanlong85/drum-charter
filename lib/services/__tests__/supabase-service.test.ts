import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithRetry, supabaseService } from '../supabase-service';

// Helper to create a mock Supabase response
const mockResponse = (data: any = null, error: any = null) => ({
  data,
  error,
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  single: vi.fn().mockResolvedValue({ data, error }),
  select: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
});

const mockSupabase: any = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('supabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('CRUD Operations', () => {
    const userId = 'user-123';

    it('saveSongChart throws error if userId is missing', async () => {
      await expect(supabaseService.saveSongChart({ userId: undefined } as any)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('saveSongChart upserts data using default client', async () => {
      const mockChart = {
        id: 'chart-1',
        userId,
        header: {
          title: 'Test',
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          metronomeEnabled: true,
          metronomeVolume: 0.5,
        },
        sections: [],
        tags: [],
        isPublic: true,
      };

      const upsertResult = mockResponse({ id: 'chart-1', title: 'Test' });
      mockSupabase.from.mockReturnValue(upsertResult);

      const result = await supabaseService.saveSongChart(mockChart as any);
      expect(result.id).toBe('chart-1');
    });

    it('saveSongChart handles error during upsert', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'Upsert fail' }));
      await expect(
        supabaseService.saveSongChart(
          { userId: 'u1', header: { title: 'T', timeSignature: {} } } as any,
          mockSupabase,
        ),
      ).rejects.toThrow('Upsert fail');
    });

    it('getSongChart fetches and migrates data', async () => {
      const dbRow = {
        id: 'chart-1',
        title: 'Test',
        time_signature: { beatsPerMeasure: 4, beatValue: 4 },
        sections: [
          {
            id: 's1',
            grid: {
              timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
              resolution: 16,
              measures: 1,
              instruments: [{ instrumentId: 'kick', notes: [] }],
            },
          },
        ],
        user_id: userId,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));

      const result = await supabaseService.getSongChart('chart-1', mockSupabase);
      expect(result.id).toBe('chart-1');
      expect(result.sections[0].grid?.instruments[0].category).toBe('kick');
    });

    it('getSongChart using default client', async () => {
      const dbRow = {
        id: 'chart-1',
        title: 'Test',
        time_signature: { beatsPerMeasure: 4, beatValue: 4 },
        sections: [],
        user_id: userId,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getSongChart('chart-1');
      expect(result.id).toBe('chart-1');
    });

    it('getSongChart migrates subSections', async () => {
      const dbRow = {
        id: 'chart-1',
        title: 'Test',
        time_signature: { beatsPerMeasure: 4, beatValue: 4 },
        sections: [
          {
            id: 's1',
            grid: {
              timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
              resolution: 16,
              measures: 1,
              instruments: [],
            },
            subSections: [
              {
                id: 'ss1',
                grid: {
                  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
                  resolution: 16,
                  measures: 1,
                  instruments: [],
                },
              },
            ],
          },
        ],
        user_id: userId,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getSongChart('chart-1', mockSupabase);
      expect(result.sections[0].subSections![0].grid).toBeDefined();
    });

    it('saveNotebook throws error if userId is missing', async () => {
      await expect(supabaseService.saveNotebook({ userId: undefined } as any)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('saveNotebook upserts and returns data', async () => {
      const mockNb = { id: 'nb-1', userId, title: 'NB', sections: [], tags: [], isPublic: false };
      mockSupabase.from.mockReturnValue(mockResponse({ id: 'nb-1' }));
      const result = await supabaseService.saveNotebook(mockNb as any);
      expect(result.id).toBe('nb-1');
    });

    it('saveNotebook handles error', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'NB error' }));
      await expect(
        supabaseService.saveNotebook({ userId: 'u1' } as any, mockSupabase),
      ).rejects.toThrow('NB error');
    });

    it('getNotebook fetches and migrates data', async () => {
      const dbRow = {
        id: 'nb-1',
        title: 'NB',
        sections: [
          {
            id: 's1',
            grid: {
              timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
              resolution: 16,
              measures: 1,
              instruments: [],
            },
          },
        ],
        user_id: userId,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getNotebook('nb-1');
      expect(result.id).toBe('nb-1');
    });

    it('saveGrooveSnippet throws error if userId is missing', async () => {
      await expect(supabaseService.saveGrooveSnippet({ userId: undefined } as any)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('saveGrooveSnippet upserts and returns data', async () => {
      const mockSnip = {
        id: 'snip-1',
        userId,
        title: 'Snip',
        tags: [],
        isPublic: true,
        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
        resolution: 16,
        measures: 1,
        instruments: [],
        playbackOptionalHits: false,
      };
      mockSupabase.from.mockReturnValue(mockResponse({ id: 'snip-1' }));
      const result = await supabaseService.saveGrooveSnippet(mockSnip as any);
      expect(result.id).toBe('snip-1');
    });

    it('saveGrooveSnippet handles error', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'Snip error' }));
      await expect(
        supabaseService.saveGrooveSnippet({ userId: 'u1' } as any, mockSupabase),
      ).rejects.toThrow('Snip error');
    });

    it('getGrooveSnippet fetches and migrates data', async () => {
      const dbRow = {
        id: 'snip-1',
        title: 'Snip',
        user_id: userId,
        grid_data: {
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          resolution: 16,
          measures: 1,
          instruments: [],
          playbackOptionalHits: false,
        },
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getGrooveSnippet('snip-1');
      expect(result.id).toBe('snip-1');
      expect(result.playbackOptionalHits).toBe(false);
    });

    it('getGrooveSnippet throws if migration fails', async () => {
      const dbRow = {
        id: 's1',
        title: 'Snip',
        user_id: userId,
        grid_data: null,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      await expect(supabaseService.getGrooveSnippet('s1', mockSupabase)).rejects.toThrow(
        'Invalid grid data',
      );
    });

    it('listSongCharts, listNotebooks, listGrooveSnippets return data', async () => {
      mockSupabase.from.mockReturnValue(mockResponse([{ id: '1' }]));

      const charts = await supabaseService.listSongCharts();
      const notebooks = await supabaseService.listNotebooks();
      const snippets = await supabaseService.listGrooveSnippets();

      expect(charts).toHaveLength(1);
      expect(notebooks).toHaveLength(1);
      expect(snippets).toHaveLength(1);
    });

    it('list operations throw if error occurs', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'List error' }));
      await expect(supabaseService.listSongCharts(mockSupabase)).rejects.toThrow('List error');
      await expect(supabaseService.listNotebooks(mockSupabase)).rejects.toThrow('List error');
      await expect(supabaseService.listGrooveSnippets(mockSupabase)).rejects.toThrow('List error');
    });

    it('delete operations call supabase delete', async () => {
      mockSupabase.from.mockReturnValue(mockResponse());
      await supabaseService.deleteSongChart('1');
      await supabaseService.deleteNotebook('1');
      await supabaseService.deleteGrooveSnippet('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('song_charts');
      expect(mockSupabase.from).toHaveBeenCalledWith('notebooks');
      expect(mockSupabase.from).toHaveBeenCalledWith('groove_snippets');
    });
  });

  describe('Duplication', () => {
    it('duplicateSongChart clones and saves with new title', async () => {
      const original = {
        id: '1',
        title: 'Orig',
        user_id: 'u1',
        time_signature: { beatsPerMeasure: 4, beatValue: 4 },
        sections: [],
        tags: [],
        metronome_enabled: true,
        metronome_volume: 0.5,
      };
      // Mock getSongChart response
      mockSupabase.from.mockReturnValueOnce(mockResponse(original));
      // Mock auth.getUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      // Mock saveSongChart response
      mockSupabase.from.mockReturnValueOnce(mockResponse({ id: '2' }));

      const result = await supabaseService.duplicateSongChart('1');
      expect(result.id).toBe('2');
    });

    it('duplicateNotebook clones and saves with new title', async () => {
      const original = { id: 'nb1', title: 'Orig', sections: [], tags: [], user_id: 'u1' };
      mockSupabase.from.mockReturnValueOnce(mockResponse(original));
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      mockSupabase.from.mockReturnValueOnce(mockResponse({ id: 'nb2' }));

      const result = await supabaseService.duplicateNotebook('nb1');
      expect(result.id).toBe('nb2');
    });

    it('duplicateGrooveSnippet clones and saves with new title', async () => {
      const original = {
        id: 's1',
        title: 'Orig',
        user_id: 'u1',
        grid_data: {
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          resolution: 16,
          measures: 1,
          instruments: [],
        },
      };
      mockSupabase.from.mockReturnValueOnce(mockResponse(original));
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      mockSupabase.from.mockReturnValueOnce(mockResponse({ id: 's2' }));

      const result = await supabaseService.duplicateGrooveSnippet('s1');
      expect(result.id).toBe('s2');
    });

    it('throws error if user not authenticated during duplication', async () => {
      const original = {
        id: '1',
        title: 'Orig',
        user_id: 'u1',
        time_signature: { beatsPerMeasure: 4, beatValue: 4 },
        sections: [],
        tags: [],
        metronome_enabled: true,
        metronome_volume: 0.5,
      };
      mockSupabase.from.mockReturnValueOnce(mockResponse(original));
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth fail'),
      });
      await expect(supabaseService.duplicateSongChart('1', mockSupabase)).rejects.toThrow(
        'Authenticated user required',
      );
    });
  });

  describe('fetchWithRetry', () => {
    it('bails immediately on 404 error', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: null, error: { status: 404 } });
      const result = await fetchWithRetry(fetchFn, '1', 'Test', 3, 100);
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('bails on specific error codes like PGRST116', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const result = await fetchWithRetry(fetchFn, '1', 'Test', 3, 100);
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('bails on 401/403 status', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: null, error: { status: 401 } });
      const result = await fetchWithRetry(fetchFn, '1', 'Test', 3, 100);
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('bails immediately if data is null and no error (definitive not found)', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: null, error: null });
      const result = await fetchWithRetry(fetchFn, '1', 'Test', 3, 100);
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('retries on transient errors and bails if error becomes bailable during retry', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'Timeout', code: '500' } })
        .mockResolvedValueOnce({ data: null, error: { status: 404 } });

      const promise = fetchWithRetry(fetchFn, '1', 'Test', 3, 100);
      await vi.advanceTimersByTimeAsync(150);
      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('retries on transient errors and bails if no data found on retry', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'Timeout', code: '500' } })
        .mockResolvedValueOnce({ data: null, error: null });

      const promise = fetchWithRetry(fetchFn, '1', 'Test', 3, 100);
      await vi.advanceTimersByTimeAsync(150);
      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('retries on transient errors and succeeds', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'Network Timeout', code: '500' } })
        .mockResolvedValueOnce({ data: { id: '1' }, error: null });

      const promise = fetchWithRetry(fetchFn, '1', 'Test', 3, 100);

      // Wait for the first attempt and delay
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result.id).toBe('1');
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('bails after max attempts', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Fail', code: '500' } });

      const promise = fetchWithRetry(fetchFn, '1', 'Test', 2, 100);

      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
