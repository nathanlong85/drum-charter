import { createClient } from '@/lib/supabase/client'
import { SongChart, GrooveSnippet, Notebook } from '../types/groove'

const supabase = createClient()

export const supabaseService = {
  // --- Song Charts ---
  async saveSongChart(chart: SongChart) {
    const { data, error } = await supabase
      .from('song_charts')
      .upsert({
        id: chart.id,
        title: chart.header.title,
        bpm: chart.header.bpm,
        time_signature: chart.header.timeSignature,
        sections: chart.sections,
        tags: chart.tags,
        is_public: chart.isPublic,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return data[0]
  },

  async getSongChart(id: string) {
    const { data, error } = await supabase
      .from('song_charts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
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
  async saveNotebook(notebook: Notebook) {
    const { data, error } = await supabase
      .from('notebooks')
      .upsert({
        id: notebook.id,
        title: notebook.title,
        sections: notebook.sections,
        tags: notebook.tags,
        is_public: notebook.isPublic,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return data[0]
  },

  async getNotebook(id: string) {
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
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

  // --- Groove Snippets ---
  async saveGrooveSnippet(snippet: GrooveSnippet) {
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
        },
        is_public: snippet.isPublic,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return data[0]
  },

  async listGrooveSnippets() {
    const { data, error } = await supabase
      .from('groove_snippets')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },
}
