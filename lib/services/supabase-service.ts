import { createClient } from '@/lib/supabase/client'
import { SongChart, GrooveSnippet, Notebook, TimeSignature, SongSection, NotebookSection, GrooveGrid } from '../types/groove'
import { Database } from '../supabase/database.types'

type DbSongChart = Database['public']['Tables']['song_charts']['Row']
type DbNotebook = Database['public']['Tables']['notebooks']['Row']
type DbGrooveSnippet = Database['public']['Tables']['groove_snippets']['Row']

const supabase = createClient()

export const SNIPPET_RETRY_DELAY_MS = 1500;

export const supabaseService = {
  // --- Song Charts ---
  async saveSongChart(chart: SongChart): Promise<DbSongChart> {
    const { data, error } = await supabase
      .from('song_charts')
      .upsert({
        id: chart.id || undefined,
        title: chart.header.title,
        bpm: chart.header.bpm || null,
        time_signature: chart.header.timeSignature as unknown as Database['public']['Tables']['song_charts']['Insert']['time_signature'],
        sections: chart.sections as unknown as Database['public']['Tables']['song_charts']['Insert']['sections'],
        tags: chart.tags,
        is_public: chart.isPublic,
        metronome_enabled: chart.header.metronomeEnabled,
        metronome_volume: chart.header.metronomeVolume,
        updated_at: new Date().toISOString(),
        user_id: chart.userId || undefined, // Let Supabase handle it via auth.uid() if not provided
      })
      .select()
      .single()

    if (error) {
      console.error(`Supabase error in saveSongChart:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    return data
  },

  async getSongChart(id: string): Promise<SongChart> {
    const { data, error } = await supabase
      .from('song_charts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    
    // Map DB row to SongChart interface
    return {
      id: data.id,
      header: {
        title: data.title,
        bpm: data.bpm || undefined,
        timeSignature: data.time_signature as unknown as TimeSignature,
        metronomeEnabled: !!data.metronome_enabled,
        metronomeVolume: data.metronome_volume ?? 0.5,
      },
      sections: data.sections as unknown as SongSection[],
      tags: data.tags || [],
      userId: data.user_id,
      isPublic: !!data.is_public,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || '',
    }
  },

  async listSongCharts() {
    const { data, error } = await supabase
      .from('song_charts')
      .select('id, title, bpm, created_at')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },

  // --- Notebooks ---
  async saveNotebook(notebook: Notebook): Promise<DbNotebook> {
    const { data, error } = await supabase
      .from('notebooks')
      .upsert({
        id: notebook.id || undefined,
        title: notebook.title,
        sections: notebook.sections as unknown as Database['public']['Tables']['notebooks']['Insert']['sections'],
        tags: notebook.tags,
        is_public: notebook.isPublic,
        updated_at: new Date().toISOString(),
        user_id: notebook.userId || undefined,
      })
      .select()
      .single()

    if (error) {
      console.error(`Supabase error in saveNotebook:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    return data
  },

  async getNotebook(id: string): Promise<Notebook> {
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    
    return {
      id: data.id,
      title: data.title,
      sections: data.sections as unknown as NotebookSection[],
      tags: data.tags || [],
      userId: data.user_id,
      isPublic: !!data.is_public,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || '',
    }
  },

  async listNotebooks() {
    const { data, error } = await supabase
      .from('notebooks')
      .select('id, title, created_at')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },

  async deleteSongChart(id: string) {
    const { error } = await supabase
      .from('song_charts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async deleteNotebook(id: string) {
    const { error } = await supabase
      .from('notebooks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async deleteGrooveSnippet(id: string) {
    const { error } = await supabase
      .from('groove_snippets')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async duplicateSongChart(id: string): Promise<DbSongChart> {
    const original = await this.getSongChart(id)
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = original
    
    return this.saveSongChart({
      ...rest,
      id: undefined, // Will be generated by Supabase
      header: {
        ...rest.header,
        title: `${rest.header.title} (Copy)`,
      },
      isPublic: false,
    })
  },

  async duplicateNotebook(id: string): Promise<DbNotebook> {
    const original = await this.getNotebook(id)
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = original
    
    return this.saveNotebook({
      ...rest,
      id: undefined,
      title: `${rest.title} (Copy)`,
      isPublic: false,
    })
  },

  async duplicateGrooveSnippet(id: string): Promise<DbGrooveSnippet> {
    const original = await this.getGrooveSnippet(id)
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = original
    
    return this.saveGrooveSnippet({
      ...rest,
      id: undefined,
      title: `${rest.title} (Copy)`,
      isPublic: false,
    })
  },

  // --- Groove Snippets ---
  async saveGrooveSnippet(snippet: GrooveSnippet): Promise<DbGrooveSnippet> {
    const { data, error } = await supabase
      .from('groove_snippets')
      .upsert({
        id: snippet.id || undefined,
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
        user_id: snippet.userId || undefined,
      })
      .select()
      .single()

    if (error) {
      console.error(`Supabase error in saveGrooveSnippet:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    return data
  },

  async listGrooveSnippets() {
    const { data, error } = await supabase
      .from('groove_snippets')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getGrooveSnippet(id: string): Promise<GrooveSnippet> {
    const { data, error } = await supabase
      .from('groove_snippets')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error(`Supabase error in getGrooveSnippet:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error
    }

    let finalData = data;

    if (!finalData) {
      // Try one more time after a short delay to handle local Supabase sync issues
      console.warn(`[supabaseService] Snippet not found initially: ${id}. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, SNIPPET_RETRY_DELAY_MS));
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
          code: retryResult.error.code
        });
        throw retryResult.error;
      }

      if (!retryResult.data) {
        console.error(`Groove snippet not found: ${id}`);
        throw new Error('Snippet not found');
      }

      finalData = retryResult.data;
      console.log(`[supabaseService] Snippet found after retry: ${id}`);
    }
    
    const gridData = finalData.grid_data as unknown as GrooveGrid;
    
    return {
      id: finalData.id,
      title: finalData.title,
      tags: finalData.tags || [],
      userId: finalData.user_id,
      isPublic: !!finalData.is_public,
      createdAt: finalData.created_at || '',
      updatedAt: finalData.updated_at || '',
      ...gridData
    }
  },
}
