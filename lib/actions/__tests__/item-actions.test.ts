import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createItemAction } from '../item-actions';

const mockGetUser = vi.fn();
const mockSaveSongChart = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/services/supabase-service', () => ({
  supabaseService: {
    saveSongChart: (...args: unknown[]) => mockSaveSongChart(...args),
    saveNotebook: vi.fn(async () => ({ id: 'nb-1' })),
    saveGrooveSnippet: vi.fn(async () => ({ id: 'snip-1' })),
    saveSetlist: vi.fn(async () => ({ id: 'set-1' })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('createItemAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockSaveSongChart.mockResolvedValue({ id: 'song-new' });
  });

  it('returns unauthorized when not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await createItemAction('song');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('creates a song and returns id', async () => {
    const result = await createItemAction('song');
    expect(result.success).toBe(true);
    expect(result.id).toBe('song-new');
    expect(result.routePrefix).toBe('songs');
    expect(mockSaveSongChart).toHaveBeenCalled();
  });
});
