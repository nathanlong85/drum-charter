import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '../supabase/database.types';
import type { Setlist, SetlistItem } from '../types/groove';
import { generateId } from '../utils/id';
import { fetchWithRetry } from './fetch-with-retry';
import { fromJson, toJson } from './json-helpers';

type DbSetlist = Database['public']['Tables']['setlists']['Row'];

function getClient(supabaseParam?: SupabaseClient<Database>) {
  return supabaseParam || createBrowserClient();
}

export async function saveSetlist(
  setlist: Setlist,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbSetlist> {
  const supabase = getClient(supabaseParam);
  if (!setlist.userId) {
    throw new Error('User ID is required to save a setlist');
  }

  const { data, error } = await supabase
    .from('setlists')
    .upsert({
      id: setlist.id,
      title: setlist.title,
      songs: toJson(setlist.songs),
      is_public: setlist.isPublic,
      updated_at: new Date().toISOString(),
      user_id: setlist.userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error in saveSetlist:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
}

export async function getSetlist(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<Setlist> {
  const supabase = getClient(supabaseParam);

  const data = await fetchWithRetry<DbSetlist>(() =>
    supabase.from('setlists').select('*').eq('id', id).single(),
  );

  if (!data) {
    throw new Error('Setlist not found');
  }

  return {
    id: data.id,
    title: data.title,
    songs: fromJson<SetlistItem[]>(data.songs),
    userId: data.user_id,
    isPublic: !!data.is_public,
    createdAt: data.created_at || null,
    updatedAt: data.updated_at || null,
  };
}

export async function listSetlists(supabaseParam?: SupabaseClient<Database>) {
  const supabase = getClient(supabaseParam);
  const { data, error } = await supabase
    .from('setlists')
    .select('id, title, created_at')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteSetlist(id: string, supabaseParam?: SupabaseClient<Database>) {
  const supabase = getClient(supabaseParam);
  const { data, error } = await supabase.from('setlists').delete().eq('id', id).select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Setlist not found or deletion blocked: ${id}`);
  }
}

export async function duplicateSetlist(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbSetlist> {
  const supabase = getClient(supabaseParam);
  const original = await getSetlist(id, supabase);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authenticated user required to duplicate a setlist');
  }

  const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

  const duplicate: Setlist = {
    ...rest,
    id: generateId(),
    userId: user.id,
    createdAt: null,
    updatedAt: null,
    title: `${rest.title} (Copy)`,
    isPublic: false,
  };

  return saveSetlist(duplicate, supabase);
}
