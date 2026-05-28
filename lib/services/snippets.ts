import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '../supabase/database.types';
import type { GrooveGrid, GrooveSnippet } from '../types/groove';
import { generateId } from '../utils/id';
import { fetchWithRetry } from './fetch-with-retry';
import { fromJson, toJson } from './json-helpers';
import { migrateGrooveGrid } from './migrations/groove-grid';

type DbGrooveSnippet = Database['public']['Tables']['groove_snippets']['Row'];

function getClient(supabaseParam?: SupabaseClient<Database>) {
  return supabaseParam || createBrowserClient();
}

export async function saveGrooveSnippet(
  snippet: GrooveSnippet,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbGrooveSnippet> {
  const supabase = getClient(supabaseParam);
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
        playbackOptionalHits: snippet.playbackOptionalHits,
      }),
      is_public: snippet.isPublic,
      updated_at: new Date().toISOString(),
      user_id: snippet.userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error in saveGrooveSnippet:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
}

export async function listGrooveSnippets(supabaseParam?: SupabaseClient<Database>, limit?: number) {
  const supabase = getClient(supabaseParam);
  let query = supabase
    .from('groove_snippets')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listGrooveSnippetsMapped(
  supabaseParam?: SupabaseClient<Database>,
): Promise<GrooveSnippet[]> {
  const supabase = getClient(supabaseParam);
  const { data, error } = await supabase
    .from('groove_snippets')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).reduce<GrooveSnippet[]>((acc, row) => {
    const rawGrid = fromJson<GrooveGrid>(row.grid_data);
    const gridData = migrateGrooveGrid(rawGrid);

    if (!gridData) {
      console.warn(`Skipping snippet ${row.id} due to invalid or missing grid data`);
      return acc;
    }

    acc.push({
      id: row.id,
      title: row.title,
      tags: row.tags || [],
      userId: row.user_id,
      isPublic: !!row.is_public,
      createdAt: row.created_at || null,
      updatedAt: row.updated_at || null,
      ...gridData,
    });

    return acc;
  }, []);
}

export async function getGrooveSnippet(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<GrooveSnippet> {
  const supabase = getClient(supabaseParam);

  const data = await fetchWithRetry<DbGrooveSnippet>(() =>
    supabase.from('groove_snippets').select('*').eq('id', id).single(),
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
}

export async function deleteGrooveSnippet(id: string, supabaseParam?: SupabaseClient<Database>) {
  const supabase = getClient(supabaseParam);
  const { error } = await supabase.from('groove_snippets').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateGrooveSnippet(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbGrooveSnippet> {
  const supabase = getClient(supabaseParam);
  const original = await getGrooveSnippet(id, supabase);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Authenticated user required to duplicate a groove snippet');
  }

  const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

  const duplicate: GrooveSnippet = {
    ...rest,
    id: generateId(),
    userId: userData.user.id,
    createdAt: null,
    updatedAt: null,
    title: `${rest.title} (Copy)`,
    isPublic: false,
  };

  return saveGrooveSnippet(duplicate, supabase);
}
