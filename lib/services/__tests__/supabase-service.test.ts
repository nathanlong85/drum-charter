import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseService } from '../supabase-service';

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
    },
  }),
}));

describe('supabaseService Duplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('duplicateSongChart', () => {
    it('should fetch the original, modify it, and save as new', async () => {
      const mockOriginal = {
        id: '123',
        header: {
          title: 'Original Song',
          bpm: 120,
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
        },
        sections: [],
        tags: ['rock'],
        userId: 'user-1',
        isPublic: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      // Mock getSongChart (by mocking the chain that getSongChart uses)
      vi.spyOn(supabaseService, 'getSongChart').mockResolvedValue(mockOriginal as any);
      
      // Mock saveSongChart
      const saveSpy = vi.spyOn(supabaseService, 'saveSongChart').mockResolvedValue({ id: '456', title: 'Original Song (Copy)' } as any);

      const result = await supabaseService.duplicateSongChart('123');

      expect(supabaseService.getSongChart).toHaveBeenCalledWith('123');
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: undefined,
        header: expect.objectContaining({
          title: 'Original Song (Copy)',
        }),
        isPublic: false,
      }));
      expect(result.id).toBe('456');
    });
  });

  describe('duplicateNotebook', () => {
    it('should fetch the original, modify it, and save as new', async () => {
      const mockOriginal = {
        id: 'nb-123',
        title: 'Original Notebook',
        sections: [],
        tags: ['practice'],
        userId: 'user-1',
        isPublic: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      vi.spyOn(supabaseService, 'getNotebook').mockResolvedValue(mockOriginal as any);
      const saveSpy = vi.spyOn(supabaseService, 'saveNotebook').mockResolvedValue({ id: 'nb-456', title: 'Original Notebook (Copy)' } as any);

      const result = await supabaseService.duplicateNotebook('nb-123');

      expect(supabaseService.getNotebook).toHaveBeenCalledWith('nb-123');
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: undefined,
        title: 'Original Notebook (Copy)',
        isPublic: false,
      }));
    });
  });

  describe('duplicateGrooveSnippet', () => {
    it('should fetch the original, modify it, and save as new', async () => {
      const mockOriginal = {
        id: 'snip-123',
        title: 'Original Snippet',
        tags: ['funk'],
        userId: 'user-1',
        isPublic: true,
        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
        resolution: 16,
        measures: 1,
        instruments: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      vi.spyOn(supabaseService, 'getGrooveSnippet').mockResolvedValue(mockOriginal as any);
      const saveSpy = vi.spyOn(supabaseService, 'saveGrooveSnippet').mockResolvedValue({ id: 'snip-456', title: 'Original Snippet (Copy)' } as any);

      const result = await supabaseService.duplicateGrooveSnippet('snip-123');

      expect(supabaseService.getGrooveSnippet).toHaveBeenCalledWith('snip-123');
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: undefined,
        title: 'Original Snippet (Copy)',
        isPublic: false,
      }));
    });
  });
});
