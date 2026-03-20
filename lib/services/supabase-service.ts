import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database, Json } from '../supabase/database.types';
import type {
  DrumCategory,
  DrumInstrument,
  GrooveGrid,
  GrooveSnippet,
  Notebook,
  NotebookSection,
  SongChart,
  SongSection,
  TimeSignature,
} from '../types/groove';

type DbSongChart = Database['public']['Tables']['song_charts']['Row'];
type DbNotebook = Database['public']['Tables']['notebooks']['Row'];
type DbGrooveSnippet = Database['public']['Tables']['groove_snippets']['Row'];

// Helper to safely cast domain types to Supabase JSON fields
const toJson = <T>(val: T): Json => val as unknown as Json;
// Helper to safely cast Supabase JSON fields back to domain types
const fromJson = <T>(val: Json): T => val as unknown as T;

/**
 * Migration helper to transition old InstrumentGrid data to DrumInstrument (#27).
 */
function migrateGrooveGrid(grid: any): GrooveGrid | undefined {
  if (!grid) return undefined;

  const instruments = (grid.instruments || []).map((inst: any) => {
    // If already migrated, return as is
    if (inst.category && inst.id && inst.presetVariety) {
      return inst as DrumInstrument;
    }

    // Migration mapping
    const instrumentId = (inst.instrumentId || '').toLowerCase();
    const label = inst.label || '';

    let category: DrumCategory = 'misc';
    let presetVariety = 'Misc';

    if (
      instrumentId.includes('kick') ||
      instrumentId.includes('bd') ||
      instrumentId.includes('bass')
    ) {
      category = 'kick';
      presetVariety = 'Kick';
    } else if (instrumentId.includes('snare') || instrumentId.includes('sn')) {
      category = 'snare';
      presetVariety = 'Snare';
    } else if (
      instrumentId.includes('hi_hat') ||
      instrumentId.includes('hh') ||
      instrumentId.includes('hat')
    ) {
      category = 'hi-hat';
      presetVariety = 'Hi-Hat';
    } else if (instrumentId.includes('ride')) {
      category = 'ride';
      presetVariety = 'Ride';
    } else if (instrumentId.includes('crash')) {
      category = 'crash';
      presetVariety = 'Crash';
    } else if (instrumentId.includes('tom')) {
      category = 'tom';
      if (instrumentId.includes('high')) presetVariety = 'High Tom';
      else if (instrumentId.includes('mid')) presetVariety = 'Mid Tom';
      else if (instrumentId.includes('floor')) presetVariety = 'Floor Tom';
      else presetVariety = 'Mid Tom';
    }

    return {
      id: inst.instrumentId || crypto.randomUUID?.() || Math.random().toString(36).substring(2),
      category,
      presetVariety,
      customName: label,
      notes: inst.notes || [],
      velocities: inst.velocities,
    } as DrumInstrument;
  });

  return {
    ...grid,
    instruments,
  };
}

const _SNIPPET_RETRY_DELAY_MS = 3000;

/**
 * Shared retry helper for fetching data from Supabase.
 * Bails early on 404/401/403 errors and only retries on transient network or server issues.
 */
async function fetchWithRetry<T>(
  fetchFn: () => PromiseLike<{ data: T | null; error: unknown }>,
  id: string,
  typeName: string,
  maxAttempts = 3,
  delayMs = _SNIPPET_RETRY_DELAY_MS,
): Promise<T | null> {
  let attempts = 0;
  let { data, error } = await fetchFn();

  const isBailableError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const errorObj = err as { code?: string | number; status?: string | number };
    const code = String(errorObj.code);
    const status = Number(errorObj.status);
    return (
      ['PGRST116', '22P02', '401', '403', '404'].includes(code) ||
      status === 404 ||
      status === 401 ||
      status === 403
    );
  };

  if (error) {
    if (isBailableError(error)) {
      return null;
    }
    console.warn(`[supabaseService] Initial fetch error for ${typeName} ${id}:`, error);
  } else if (!data) {
    // Definitive "not found" (null data, null error) - bail immediately
    return null;
  }

  while (!data && attempts < maxAttempts) {
    attempts++;
    console.warn(
      `[supabaseService] ${typeName} not found initially: ${id}. Retry attempt ${attempts}/${maxAttempts}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const retryResult = await fetchFn();
    data = retryResult.data;
    error = retryResult.error;

    if (error) {
      if (isBailableError(error)) {
        return null;
      }
      console.error(`[supabaseService] Retry error for ${typeName} ${id}:`, error);
    } else if (!data) {
      // Definitive "not found" on retry - bail immediately
      return null;
    }

    if (data) {
      console.log(`[supabaseService] ${typeName} found after retry: ${id}`);
      return data;
    }
  }

  return data;
}

export const supabaseService = {
  // --- Song Charts ---
  async saveSongChart(
    chart: SongChart,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<DbSongChart> {
    const supabase = supabaseParam || createBrowserClient();
    if (!chart.userId) {
      throw new Error('User ID is required to save a song chart');
    }

    const { data, error } = await supabase
      .from('song_charts')
      .upsert({
        id: chart.id,
        title: chart.header.title,
        bpm: chart.header.bpm ?? null,
        time_signature: toJson(chart.header.timeSignature),
        sections: toJson(chart.sections),
        tags: chart.tags,
        is_public: chart.isPublic,
        metronome_enabled: chart.header.metronomeEnabled,
        metronome_volume: chart.header.metronomeVolume,
        updated_at: new Date().toISOString(),
        user_id: chart.userId,
      })
      .select()
      .single();

    if (error) {
      console.error(`Supabase error in saveSongChart:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    return data;
  },

  async getSongChart(id: string, supabaseParam?: SupabaseClient<Database>): Promise<SongChart> {
    const supabase = supabaseParam || createBrowserClient();

    const data = await fetchWithRetry<DbSongChart>(
      () => supabase.from('song_charts').select('*').eq('id', id).maybeSingle(),
      id,
      'Song chart',
    );

    if (!data) {
      throw new Error('Song chart not found');
    }

    // Map DB row to SongChart interface
    const sections = fromJson<SongSection[]>(data.sections).map((s) => ({
      ...s,
      grid: s.grid ? migrateGrooveGrid(s.grid) : undefined,
      subSections: s.subSections?.map((ss) => ({
        ...ss,
        grid: ss.grid ? migrateGrooveGrid(ss.grid) : undefined,
      })),
    }));

    return {
      id: data.id,
      header: {
        title: data.title,
        bpm: data.bpm || undefined,
        timeSignature: fromJson<TimeSignature>(data.time_signature),
        metronomeEnabled: !!data.metronome_enabled,
        metronomeVolume: data.metronome_volume ?? 0.5,
      },
      sections,
      tags: data.tags || [],
      userId: data.user_id,
      isPublic: !!data.is_public,
      createdAt: data.created_at || null,
      updatedAt: data.updated_at || null,
    };
  },

  async listSongCharts(supabaseParam?: SupabaseClient<Database>) {
    const supabase = supabaseParam || createBrowserClient();
    const { data, error } = await supabase
      .from('song_charts')
      .select('id, title, bpm, created_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // --- Notebooks ---
  async saveNotebook(
    notebook: Notebook,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<DbNotebook> {
    const supabase = supabaseParam || createBrowserClient();
    if (!notebook.userId) {
      throw new Error('User ID is required to save a notebook');
    }

    const { data, error } = await supabase
      .from('notebooks')
      .upsert({
        id: notebook.id,
        title: notebook.title,
        sections: toJson(notebook.sections),
        tags: notebook.tags,
        is_public: notebook.isPublic,
        updated_at: new Date().toISOString(),
        user_id: notebook.userId,
      })
      .select()
      .single();

    if (error) {
      console.error(`Supabase error in saveNotebook:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    return data;
  },

  async getNotebook(id: string, supabaseParam?: SupabaseClient<Database>): Promise<Notebook> {
    const supabase = supabaseParam || createBrowserClient();

    const data = await fetchWithRetry<DbNotebook>(
      () => supabase.from('notebooks').select('*').eq('id', id).maybeSingle(),
      id,
      'Notebook',
    );

    if (!data) {
      throw new Error('Notebook not found');
    }

    const sections = fromJson<NotebookSection[]>(data.sections).map((s) => ({
      ...s,
      grid: s.grid ? migrateGrooveGrid(s.grid) : undefined,
    }));

    return {
      id: data.id,
      title: data.title,
      sections,
      tags: data.tags || [],
      userId: data.user_id,
      isPublic: !!data.is_public,
      createdAt: data.created_at || null,
      updatedAt: data.updated_at || null,
    };
  },

  async listNotebooks(supabaseParam?: SupabaseClient<Database>) {
    const supabase = supabaseParam || createBrowserClient();
    const { data, error } = await supabase
      .from('notebooks')
      .select('id, title, created_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteSongChart(id: string, supabaseParam?: SupabaseClient<Database>) {
    const supabase = supabaseParam || createBrowserClient();
    const { error } = await supabase.from('song_charts').delete().eq('id', id);

    if (error) throw error;
  },

  async deleteNotebook(id: string, supabaseParam?: SupabaseClient<Database>) {
    const supabase = supabaseParam || createBrowserClient();
    const { error } = await supabase.from('notebooks').delete().eq('id', id);

    if (error) throw error;
  },

  async deleteGrooveSnippet(id: string, supabaseParam?: SupabaseClient<Database>) {
    const supabase = supabaseParam || createBrowserClient();
    const { error } = await supabase.from('groove_snippets').delete().eq('id', id);

    if (error) throw error;
  },

  async duplicateSongChart(
    id: string,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<DbSongChart> {
    const supabase = supabaseParam || createBrowserClient();
    const original = await this.getSongChart(id, supabase);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Authenticated user required to duplicate a song chart');
    }

    const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

    // Construct new object without ID or audit fields to satisfy TypeScript
    // and rely on saveSongChart/Supabase to handle ID generation and user_id.
    const duplicate: SongChart = {
      ...rest,
      userId: userData.user.id,
      createdAt: null,
      updatedAt: null,
      header: {
        ...rest.header,
        title: `${rest.header.title} (Copy)`,
      },
      isPublic: false,
    } as SongChart;

    return this.saveSongChart(duplicate, supabase);
  },

  async duplicateNotebook(
    id: string,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<DbNotebook> {
    const supabase = supabaseParam || createBrowserClient();
    const original = await this.getNotebook(id, supabase);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Authenticated user required to duplicate a notebook');
    }

    const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

    const duplicate: Notebook = {
      ...rest,
      userId: userData.user.id,
      createdAt: null,
      updatedAt: null,
      title: `${rest.title} (Copy)`,
      isPublic: false,
    } as Notebook;

    return this.saveNotebook(duplicate, supabase);
  },

  async duplicateGrooveSnippet(
    id: string,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<DbGrooveSnippet> {
    const supabase = supabaseParam || createBrowserClient();
    const original = await this.getGrooveSnippet(id, supabase);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Authenticated user required to duplicate a groove snippet');
    }

    const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

    const duplicate: GrooveSnippet = {
      ...rest,
      userId: userData.user.id,
      createdAt: null,
      updatedAt: null,
      title: `${rest.title} (Copy)`,
      isPublic: false,
    } as GrooveSnippet;

    return this.saveGrooveSnippet(duplicate, supabase);
  },

  // --- Groove Snippets ---
  async saveGrooveSnippet(
    snippet: GrooveSnippet,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<DbGrooveSnippet> {
    const supabase = supabaseParam || createBrowserClient();
    if (!snippet.userId) {
      throw new Error('User ID is required to save a groove snippet');
    }

    const { data, error } = await supabase
      .from('groove_snippets')
      .upsert({
        id: snippet.id,
        title: snippet.title,
        tags: snippet.tags,
        grid_data: toJson({
          timeSignature: snippet.timeSignature,
          resolution: snippet.resolution,
          measures: snippet.measures,
          instruments: snippet.instruments,
        }),
        is_public: snippet.isPublic,
        updated_at: new Date().toISOString(),
        user_id: snippet.userId,
      })
      .select()
      .single();

    if (error) {
      console.error(`Supabase error in saveGrooveSnippet:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    return data;
  },

  async listGrooveSnippets(supabaseParam?: SupabaseClient<Database>) {
    const supabase = supabaseParam || createBrowserClient();
    const { data, error } = await supabase
      .from('groove_snippets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getGrooveSnippet(
    id: string,
    supabaseParam?: SupabaseClient<Database>,
  ): Promise<GrooveSnippet> {
    const supabase = supabaseParam || createBrowserClient();

    const data = await fetchWithRetry<DbGrooveSnippet>(
      () => supabase.from('groove_snippets').select('*').eq('id', id).maybeSingle(),
      id,
      'Groove snippet',
    );

    if (!data) {
      throw new Error('Groove snippet not found');
    }

    const gridData = migrateGrooveGrid(fromJson<GrooveGrid>(data.grid_data));

    if (!gridData) {
      throw new Error('Invalid grid data in groove snippet');
    }

    return {
      id: data.id,
      title: data.title,
      tags: data.tags || [],
      userId: data.user_id,
      isPublic: !!data.is_public,
      createdAt: data.created_at || null,
      updatedAt: data.updated_at || null,
      ...gridData,
    };
  },
};
