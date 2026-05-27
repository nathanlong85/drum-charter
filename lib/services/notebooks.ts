import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '../supabase/database.types';
import type { Notebook, NotebookSection } from '../types/groove';
import { generateId } from '../utils/id';
import { fetchWithRetry } from './fetch-with-retry';
import { fromJson, toJson } from './json-helpers';
import { migrateGrooveGrid } from './migrations/groove-grid';

type DbNotebook = Database['public']['Tables']['notebooks']['Row'];

function getClient(supabaseParam?: SupabaseClient<Database>) {
  return supabaseParam || createBrowserClient();
}

export async function saveNotebook(
  notebook: Notebook,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbNotebook> {
  const supabase = getClient(supabaseParam);
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
    console.error('Supabase error in saveNotebook:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
}

export async function getNotebook(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<Notebook> {
  const supabase = getClient(supabaseParam);

  const data = await fetchWithRetry<DbNotebook>(() =>
    supabase.from('notebooks').select('*').eq('id', id).single(),
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
}

export async function listNotebooks(supabaseParam?: SupabaseClient<Database>, limit?: number) {
  const supabase = getClient(supabaseParam);
  let query = supabase
    .from('notebooks')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteNotebook(id: string, supabaseParam?: SupabaseClient<Database>) {
  const supabase = getClient(supabaseParam);
  const { error } = await supabase.from('notebooks').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateNotebook(
  id: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<DbNotebook> {
  const supabase = getClient(supabaseParam);
  const original = await getNotebook(id, supabase);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Authenticated user required to duplicate a notebook');
  }

  const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...rest } = original;

  const duplicate: Notebook = {
    ...rest,
    id: generateId(),
    userId: userData.user.id,
    createdAt: null,
    updatedAt: null,
    title: `${rest.title} (Copy)`,
    isPublic: false,
  };

  return saveNotebook(duplicate, supabase);
}
