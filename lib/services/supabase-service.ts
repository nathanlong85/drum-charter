import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '../supabase/database.types';
import type {
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

const SNIPPET_RETRY_DELAY_MS = 3000;

export const supabaseService = {
  // --- Song Charts ---
  async saveSongChart(chart: SongChart, supabaseParam?: SupabaseClient<Database>): Promise<DbSongChart> {
    const supabase = supabaseParam || createBrowserClient();
    if (!chart.userId) {
      throw new Error('User ID is required to save a song chart');
    }

    const { data, error } = await supabase
      .from('song_charts')
      .upsert({
        id: chart.id,
        title: chart.header.title,
        bpm: chart.header.bpm || null,
        time_signature: chart.header
          .timeSignature as unknown as Database['public']['Tables']['song_charts']['Insert']['time_signature'],
        sections:
          chart.sections as unknown as Database['public']['Tables']['song_charts']['Insert']['sections'],
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
    const { data, error } = await supabase.from('song_charts').select('*').eq('id', id).maybeSingle();

    if (error) {
      console.error(`Supabase error in getSongChart:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    let finalData = data;
    let attempts = 0;
    const maxAttempts = 3;

    while (!finalData && attempts < maxAttempts) {
      attempts++;
      // Try one more time after a short delay to handle local Supabase sync issues
      console.warn(`[supabaseService] Song not found initially: ${id}. Retry attempt ${attempts}/${maxAttempts}...`);
      await new Promise((resolve) => setTimeout(resolve, SNIPPET_RETRY_DELAY_MS));
      const retryResult = await supabase.from('song_charts').select('*').eq('id', id).maybeSingle();

      if (retryResult.error) {
        console.error(`Supabase retry error in getSongChart:`, {
          message: retryResult.error.message,
          details: retryResult.error.details,
          hint: retryResult.error.hint,
          code: retryResult.error.code,
        });
        throw retryResult.error;
      }

      finalData = retryResult.data;
      if (finalData) {
        console.log(`[supabaseService] Song found after retry: ${id}`);
      }
    }

    if (!finalData) {
      console.error(`Song chart not found after ${maxAttempts} retries: ${id}`);
      throw new Error('Song chart not found');
    }

    // Map DB row to SongChart interface
    return {
      id: finalData.id,
      header: {
        title: finalData.title,
        bpm: finalData.bpm || undefined,
        timeSignature: finalData.time_signature as unknown as TimeSignature,
        metronomeEnabled: !!finalData.metronome_enabled,
        metronomeVolume: finalData.metronome_volume ?? 0.5,
      },
      sections: finalData.sections as unknown as SongSection[],
      tags: finalData.tags || [],
      userId: finalData.user_id,
      isPublic: !!finalData.is_public,
      createdAt: finalData.created_at || null,
      updatedAt: finalData.updated_at || null,
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
  async saveNotebook(notebook: Notebook, supabaseParam?: SupabaseClient<Database>): Promise<DbNotebook> {
    const supabase = supabaseParam || createBrowserClient();
    if (!notebook.userId) {
      throw new Error('User ID is required to save a notebook');
    }

    const { data, error } = await supabase
      .from('notebooks')
      .upsert({
        id: notebook.id,
        title: notebook.title,
        sections:
          notebook.sections as unknown as Database['public']['Tables']['notebooks']['Insert']['sections'],
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
    const { data, error } = await supabase.from('notebooks').select('*').eq('id', id).maybeSingle();

    if (error) {
      console.error(`Supabase error in getNotebook:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    let finalData = data;
    let attempts = 0;
    const maxAttempts = 3;

    while (!finalData && attempts < maxAttempts) {
      attempts++;
      // Try one more time after a short delay to handle local Supabase sync issues
      console.warn(`[supabaseService] Notebook not found initially: ${id}. Retry attempt ${attempts}/${maxAttempts}...`);
      await new Promise((resolve) => setTimeout(resolve, SNIPPET_RETRY_DELAY_MS));
      const retryResult = await supabase.from('notebooks').select('*').eq('id', id).maybeSingle();

      if (retryResult.error) {
        console.error(`Supabase retry error in getNotebook:`, {
          message: retryResult.error.message,
          details: retryResult.error.details,
          hint: retryResult.error.hint,
          code: retryResult.error.code,
        });
        throw retryResult.error;
      }

      finalData = retryResult.data;
      if (finalData) {
        console.log(`[supabaseService] Notebook found after retry: ${id}`);
      }
    }

    if (!finalData) {
      console.error(`Notebook not found after ${maxAttempts} retries: ${id}`);
      throw new Error('Notebook not found');
    }

    return {
      id: finalData.id,
      title: finalData.title,
      sections: finalData.sections as unknown as NotebookSection[],
      tags: finalData.tags || [],
      userId: finalData.user_id,
      isPublic: !!finalData.is_public,
      createdAt: finalData.created_at || null,
      updatedAt: finalData.updated_at || null,
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

  async duplicateSongChart(id: string, supabaseParam?: SupabaseClient<Database>): Promise<DbSongChart> {
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

    return this.saveSongChart(duplicate);
  },

  async duplicateNotebook(id: string, supabaseParam?: SupabaseClient<Database>): Promise<DbNotebook> {
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

    return this.saveNotebook(duplicate);
  },

  async duplicateGrooveSnippet(id: string, supabaseParam?: SupabaseClient<Database>): Promise<DbGrooveSnippet> {
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

    return this.saveGrooveSnippet(duplicate);
  },

  // --- Groove Snippets ---
  async saveGrooveSnippet(snippet: GrooveSnippet, supabaseParam?: SupabaseClient<Database>): Promise<DbGrooveSnippet> {
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
        grid_data: {
          timeSignature: snippet.timeSignature,
          resolution: snippet.resolution,
          measures: snippet.measures,
          instruments: snippet.instruments,
        } as unknown as Database['public']['Tables']['groove_snippets']['Insert']['grid_data'],
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

  async getGrooveSnippet(id: string, supabaseParam?: SupabaseClient<Database>): Promise<GrooveSnippet> {
    const supabase = supabaseParam || createBrowserClient();
    const { data, error } = await supabase
      .from('groove_snippets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Supabase error in getGrooveSnippet:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    let finalData = data;
    let attempts = 0;
    const maxAttempts = 3;

    while (!finalData && attempts < maxAttempts) {
      attempts++;
      // Try one more time after a short delay to handle local Supabase sync issues
      console.warn(`[supabaseService] Snippet not found initially: ${id}. Retry attempt ${attempts}/${maxAttempts}...`);
      await new Promise((resolve) => setTimeout(resolve, SNIPPET_RETRY_DELAY_MS));
      const retryResult = await supabase
        .from('groove_snippets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (retryResult.error) {
        console.error(`Supabase retry error in getGrooveSnippet:`, {
          message: retryResult.error.message,
          details: retryResult.error.details,
          hint: retryResult.error.hint,
          code: retryResult.error.code,
        });
        throw retryResult.error;
      }

      finalData = retryResult.data;
      if (finalData) {
        console.log(`[supabaseService] Snippet found after retry: ${id}`);
      }
    }

    if (!finalData) {
      console.error(`Groove snippet not found after ${maxAttempts} retries: ${id}`);
      throw new Error('Snippet not found');
    }

    const gridData = finalData.grid_data as unknown as GrooveGrid;

    return {
      id: finalData.id,
      title: finalData.title,
      tags: finalData.tags || [],
      userId: finalData.user_id,
      isPublic: !!finalData.is_public,
      createdAt: finalData.created_at || null,
      updatedAt: finalData.updated_at || null,
      ...gridData,
    };
  },
};
