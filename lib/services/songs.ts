import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '../supabase/database.types';
import type { SongChart, SongSection, TimeSignature } from '../types/groove';
import { generateId } from '../utils/id';
import { fetchWithRetry } from './fetch-with-retry';
import { fromJson, toJson } from './json-helpers';
import { migrateGrooveGrid } from './migrations/groove-grid';

type DbSongChart = Database['public']['Tables']['song_charts']['Row'];

function getClient(supabaseParam?: SupabaseClient<Database>) {
  return supabaseParam || createBrowserClient();
}

export async function saveSongChart(
  chart: SongChart,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbSongChart> {
  const supabase = getClient(supabaseParam);
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
      manual_order: chart.header.manualOrder ?? null,
      updated_at: new Date().toISOString(),
      user_id: chart.userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error in saveSongChart:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
}

export async function getSongChart(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<SongChart> {
  const supabase = getClient(supabaseParam);

  const data = await fetchWithRetry<DbSongChart>(() =>
    supabase.from('song_charts').select('*').eq('id', id).single(),
  );

  if (!data) {
    throw new Error('Song chart not found');
  }

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
      manualOrder: data.manual_order || undefined,
    },
    sections,
    tags: data.tags || [],
    userId: data.user_id,
    isPublic: !!data.is_public,
    createdAt: data.created_at || null,
    updatedAt: data.updated_at || null,
  };
}

export async function listSongCharts(supabaseParam?: SupabaseClient<Database>, limit?: number) {
  const supabase = getClient(supabaseParam);
  let query = supabase
    .from('song_charts')
    .select('id, title, bpm, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSongTitles(ids: string[], supabaseParam?: SupabaseClient<Database>) {
  const supabase = getClient(supabaseParam);
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase.from('song_charts').select('id, title').in('id', ids);
  if (error) throw error;
  return data;
}

export async function deleteSongChart(id: string, supabaseParam?: SupabaseClient<Database>) {
  const supabase = getClient(supabaseParam);
  const { error } = await supabase.from('song_charts').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateSongChart(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbSongChart> {
  const supabase = getClient(supabaseParam);
  const original = await getSongChart(id, supabase);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Authenticated user required to duplicate a song chart');
  }

  const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

  const duplicate: SongChart = {
    ...rest,
    id: generateId(),
    userId: userData.user.id,
    createdAt: null,
    updatedAt: null,
    header: {
      ...rest.header,
      title: `${rest.header.title} (Copy)`,
    },
    isPublic: false,
  };

  return saveSongChart(duplicate, supabase);
}
