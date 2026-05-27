import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GrooveSnippet, Notebook, Setlist, SongChart } from '@/lib/types/groove';
import { fetchWithRetry, supabaseService } from '../supabase-service';

const mockSupabase: Record<string, unknown> = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  select: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  delete: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
  in: vi.fn(),
};

// Helper to create a mock Supabase response that supports chaining
const mockResponse = <TData = unknown, TError = unknown>(
  data: TData | null = null,
  error: TError | null = null,
) => {
  const mock = {
    data,
    error,
    select: mockSupabase.select.mockReturnThis(),
    upsert: mockSupabase.upsert.mockReturnThis(),
    update: mockSupabase.update.mockReturnThis(),
    eq: mockSupabase.eq.mockReturnThis(),
    delete: mockSupabase.delete.mockReturnThis(),
    order: mockSupabase.order.mockReturnThis(),
    limit: mockSupabase.limit.mockReturnThis(),
    in: mockSupabase.in.mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  return mock;
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('supabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('CRUD Operations', () => {
    const userId = 'user-123';

    it('saveSongChart throws error if userId is missing', async () => {
      const invalidChart = { header: { title: 'T' } } as unknown as SongChart;
      await expect(supabaseService.saveSongChart(invalidChart)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('saveSongChart upserts data using default client', async () => {
      const mockChart: SongChart = {
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
        createdAt: null,
        updatedAt: null,
      };

      const upsertResult = mockResponse({ id: 'chart-1', title: 'Test' });
      mockSupabase.from.mockReturnValue(upsertResult);

      const result = await supabaseService.saveSongChart(mockChart);
      expect(result.id).toBe('chart-1');
    });

    it('saveSongChart handles error during upsert', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'Upsert fail' }));
      const invalidChart = {
        userId: 'u1',
        header: { title: 'T', timeSignature: { beatsPerMeasure: 4, beatValue: 4 } },
      } as unknown as SongChart;
      await expect(supabaseService.saveSongChart(invalidChart, mockSupabase)).rejects.toThrow(
        'Upsert fail',
      );
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
      const result = await supabaseService.getSongChart('chart-1');
      expect(result.id).toBe('chart-1');
      expect(result.sections).toHaveLength(1);
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
            name: 'Verse',
            measuresCount: 4,
            subSections: [
              {
                id: 'sub1',
                name: 'Sub',
                measuresCount: 1,
                grid: {
                  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
                  resolution: 8,
                  measures: 1,
                  instruments: [{ instrumentId: 'snare', notes: [] }],
                },
              },
            ],
          },
        ],
        user_id: userId,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getSongChart('chart-1');
      expect(result.sections[0].subSections?.[0].grid?.instruments[0].category).toBe('snare');
    });

    it('saveNotebook throws error if userId is missing', async () => {
      const invalidNb = { title: 'T' } as unknown as Notebook;
      await expect(supabaseService.saveNotebook(invalidNb)).rejects.toThrow('User ID is required');
    });

    it('saveNotebook upserts and returns data', async () => {
      const mockNb: Notebook = {
        id: 'nb-1',
        userId,
        title: 'NB',
        sections: [],
        tags: [],
        isPublic: false,
        createdAt: null,
        updatedAt: null,
      };
      mockSupabase.from.mockReturnValue(mockResponse({ id: 'nb-1' }));
      const result = await supabaseService.saveNotebook(mockNb);
      expect(result.id).toBe('nb-1');
    });

    it('saveNotebook handles error', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'NB error' }));
      const invalidNb = { userId: 'u1', title: 'T', sections: [] } as unknown as Notebook;
      await expect(supabaseService.saveNotebook(invalidNb)).rejects.toThrow('NB error');
    });

    it('getNotebook fetches and migrates data', async () => {
      const dbRow = {
        id: 'nb-1',
        title: 'NB',
        sections: [
          {
            id: 's1',
            name: 'S1',
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
      expect(result.sections).toHaveLength(1);
    });

    it('saveGrooveSnippet throws error if userId is missing', async () => {
      const invalidSnip = { title: 'T' } as unknown as GrooveSnippet;
      await expect(supabaseService.saveGrooveSnippet(invalidSnip)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('saveGrooveSnippet upserts and returns data', async () => {
      const mockSnip: GrooveSnippet = {
        id: 's-1',
        userId,
        title: 'S',
        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
        resolution: 16,
        measures: 1,
        instruments: [],
        tags: [],
        isPublic: false,
        createdAt: null,
        updatedAt: null,
      };
      mockSupabase.from.mockReturnValue(mockResponse({ id: 's-1' }));
      const result = await supabaseService.saveGrooveSnippet(mockSnip);
      expect(result.id).toBe('s-1');
    });

    it('saveGrooveSnippet handles error', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null, { message: 'Snip error' }));
      const invalidSnip = { userId: 'u1', title: 'T', grid: {} } as unknown as GrooveSnippet;
      await expect(supabaseService.saveGrooveSnippet(invalidSnip)).rejects.toThrow('Snip error');
    });

    it('getGrooveSnippet fetches and migrates data', async () => {
      const dbRow = {
        id: 's-1',
        title: 'S',
        grid_data: {
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          resolution: 16,
          measures: 1,
          instruments: [],
        },
        user_id: userId,
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getGrooveSnippet('s-1');
      expect(result.id).toBe('s-1');
    });

    it('getGrooveSnippet throws if migration fails', async () => {
      mockSupabase.from.mockReturnValue(mockResponse({ id: 's-1', grid_data: null }));
      await expect(supabaseService.getGrooveSnippet('s-1')).rejects.toThrow(
        'Invalid grid data in groove snippet',
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

    it('list operations support limit parameter', async () => {
      mockSupabase.from.mockReturnValue(mockResponse([{ id: '1' }]));
      await supabaseService.listSongCharts(mockSupabase, 5);
      await supabaseService.listNotebooks(mockSupabase, 5);
      await supabaseService.listGrooveSnippets(mockSupabase, 5);

      expect(mockSupabase.limit).toHaveBeenCalledWith(5);
      expect(mockSupabase.limit).toHaveBeenCalledTimes(3);
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

    it('saveSetlist throws error if userId is missing', async () => {
      const invalidSetlist = {
        title: 'Missing User',
        songs: [],
        isPublic: false,
      } as unknown as Setlist;
      await expect(supabaseService.saveSetlist(invalidSetlist)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('saveSetlist upserts and returns data', async () => {
      const mockSetlist: Setlist = {
        id: 'sl-1',
        userId: 'user-123',
        title: 'Setlist',
        songs: [],
        isPublic: false,
        createdAt: null,
        updatedAt: null,
      };
      mockSupabase.from.mockReturnValue(mockResponse({ id: 'sl-1' }));
      const result = await supabaseService.saveSetlist(mockSetlist);
      expect(result.id).toBe('sl-1');
    });

    it('getSetlist fetches data', async () => {
      const dbRow = {
        id: 'sl-1',
        title: 'Setlist',
        songs: [],
        user_id: 'user-123',
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getSetlist('sl-1');
      expect(result.id).toBe('sl-1');
    });

    it('listSetlists returns data', async () => {
      mockSupabase.from.mockReturnValue(mockResponse([{ id: '1' }]));
      const setlists = await supabaseService.listSetlists();
      expect(setlists).toHaveLength(1);
    });

    it('deleteSetlist calls supabase delete and throws if not found', async () => {
      // Mock found
      mockSupabase.from.mockReturnValue(mockResponse([{ id: '1' }]));
      await supabaseService.deleteSetlist('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('setlists');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');

      // Mock not found
      mockSupabase.from.mockReturnValue(mockResponse([]));
      await expect(supabaseService.deleteSetlist('2')).rejects.toThrow('Setlist not found');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '2');
    });
  });

  describe('Profiles & Preferences', () => {
    const userId = 'user-123';

    it('getProfile returns profile data if found', async () => {
      const dbRow = {
        id: userId,
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.png',
        preferences: { theme: 'dark' },
        updated_at: new Date().toISOString(),
      };
      mockSupabase.from.mockReturnValue(mockResponse(dbRow));
      const result = await supabaseService.getProfile(userId);
      expect(result.id).toBe(userId);
      expect(result.display_name).toBe('John Doe');
      expect(result.preferences.theme).toBe('dark');
    });

    it('getProfile returns default profile if not found', async () => {
      mockSupabase.from.mockReturnValue(mockResponse(null));
      const result = await supabaseService.getProfile(userId);
      expect(result.id).toBe(userId);
      expect(result.preferences.theme).toBe('system');
    });

    it('updateProfile updates and returns refreshed profile', async () => {
      const updates = { display_name: 'New Name' };
      const refreshedProfile = {
        id: userId,
        display_name: 'New Name',
        preferences: { theme: 'system' },
      };

      // Mock update call
      mockSupabase.from.mockReturnValueOnce(mockResponse({ id: userId }));
      // Mock getProfile call (after update)
      mockSupabase.from.mockReturnValueOnce(mockResponse(refreshedProfile));

      const result = await supabaseService.updateProfile(
        userId,
        updates as Partial<typeof updates>,
      );
      expect(result.display_name).toBe('New Name');
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('updatePreferences merges updates with current preferences', async () => {
      const currentProfile = {
        id: userId,
        preferences: { theme: 'light', defaultTimeSignature: { numerator: 4, denominator: 4 } },
      };
      const updates = { theme: 'dark' as const };

      // Mock getProfile (current)
      mockSupabase.from.mockReturnValueOnce(mockResponse(currentProfile));
      // Mock update call
      mockSupabase.from.mockReturnValueOnce(mockResponse({ id: userId }));
      // Mock getProfile (refreshed)
      mockSupabase.from.mockReturnValueOnce(
        mockResponse({
          ...currentProfile,
          preferences: { ...currentProfile.preferences, theme: 'dark' },
        }),
      );

      const result = await supabaseService.updatePreferences(userId, updates);
      expect(result.preferences.theme).toBe('dark');
      expect(result.preferences.defaultTimeSignature.numerator).toBe(4);
    });
  });

  describe('Duplication', () => {
    it('duplicateSongChart clones and saves with new title', async () => {
      const original = {
        id: '1',
        title: 'Orig',
        user_id: 'u1',
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
          },
        ],
        tags: [],
        metronome_enabled: true,
        metronome_volume: 0.5,
      };

      const getResponse = mockResponse(original);
      const saveResponse = mockResponse({ id: '2' });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'song_charts') {
          // First call is get, second is save (upsert)
          return mockSupabase.from.mock.calls.length % 2 === 1 ? getResponse : saveResponse;
        }
        return mockResponse();
      });

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

      const result = await supabaseService.duplicateSongChart('1');
      expect(result.id).toBe('2');
    });

    it('duplicateNotebook clones and saves with new title', async () => {
      const original = {
        id: 'nb1',
        title: 'Orig',
        sections: [
          {
            id: 's1',
            name: 'S1',
            grid: {
              timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
              resolution: 16,
              measures: 1,
              instruments: [],
            },
          },
        ],
        tags: [],
        user_id: 'u1',
      };

      const getResponse = mockResponse(original);
      const saveResponse = mockResponse({ id: 'nb2' });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'notebooks') {
          return mockSupabase.from.mock.calls.length % 2 === 1 ? getResponse : saveResponse;
        }
        return mockResponse();
      });

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

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

      const getResponse = mockResponse(original);
      const saveResponse = mockResponse({ id: 's2' });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'groove_snippets') {
          return mockSupabase.from.mock.calls.length % 2 === 1 ? getResponse : saveResponse;
        }
        return mockResponse();
      });

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

      const result = await supabaseService.duplicateGrooveSnippet('s1');
      expect(result.id).toBe('s2');
    });

    it('duplicateSetlist clones and saves with new title', async () => {
      const original = { id: 'sl1', title: 'Orig', songs: [], user_id: 'u1' };

      const getResponse = mockResponse(original);
      const saveResponse = mockResponse({ id: 'sl2' });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'setlists') {
          return mockSupabase.from.mock.calls.length % 2 === 1 ? getResponse : saveResponse;
        }
        return mockResponse();
      });

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

      const result = await supabaseService.duplicateSetlist('sl1');
      expect(result.id).toBe('sl2');
    });

    it('throws error if user not authenticated during duplication', async () => {
      const original = {
        id: '1',
        title: 'Orig',
        user_id: 'u1',
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
          },
        ],
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
    const fetchFn = vi.fn();

    beforeEach(() => {
      fetchFn.mockReset();
    });

    it('retries on 404 error', async () => {
      fetchFn.mockResolvedValue({ data: null, error: { status: 404 } });
      const promise = fetchWithRetry(fetchFn, 2, 100);
      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);
      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('retries on specific error codes like PGRST116', async () => {
      fetchFn.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const promise = fetchWithRetry(fetchFn, 2, 100);
      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);
      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('bails on 401/403 status', async () => {
      fetchFn.mockResolvedValue({ data: null, error: { status: 401 } });
      const result = await fetchWithRetry(fetchFn);
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('retries if data is null and no error initially', async () => {
      fetchFn.mockResolvedValue({ data: null, error: null });
      const promise = fetchWithRetry(fetchFn, 2, 100);
      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);
      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('retries on transient errors and bails if error becomes bailable during retry', async () => {
      fetchFn
        .mockResolvedValueOnce({ data: null, error: { message: 'Timeout', code: '500' } })
        .mockResolvedValueOnce({ data: null, error: { status: 401 } });

      const promise = fetchWithRetry(fetchFn, 3, 100);
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('retries on transient errors and eventually returns null after all attempts', async () => {
      fetchFn
        .mockResolvedValueOnce({ data: null, error: { message: 'Timeout', code: '500' } })
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      const promise = fetchWithRetry(fetchFn, 3, 100);
      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('retries on transient errors and succeeds', async () => {
      fetchFn
        .mockResolvedValueOnce({ data: null, error: { message: 'Network Timeout', code: '500' } })
        .mockResolvedValueOnce({ data: { id: '1' }, error: null });

      const promise = fetchWithRetry(fetchFn, 3, 100);
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result).toEqual({ id: '1' });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('bails after max attempts', async () => {
      fetchFn.mockResolvedValue({ data: null, error: { message: 'Fail', code: '500' } });

      const promise = fetchWithRetry(fetchFn, 2, 100);
      await vi.advanceTimersByTimeAsync(150);
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('retries when fetchFn throws', async () => {
      fetchFn
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { id: '1' }, error: null });

      const promise = fetchWithRetry(fetchFn, 3, 100);
      await vi.advanceTimersByTimeAsync(150);

      const result = await promise;
      expect(result).toEqual({ id: '1' });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });
});
