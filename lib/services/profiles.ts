import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '../supabase/database.types';
import { DEFAULT_PREFERENCES, type UserPreferences, type UserProfile } from '../types/user';

function getClient(supabaseParam?: SupabaseClient<Database>) {
  return supabaseParam || createBrowserClient();
}

export async function getProfile(
  userId: string,
  supabaseParam?: SupabaseClient<Database>,
): Promise<UserProfile> {
  const supabase = getClient(supabaseParam);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return {
      id: userId,
      username: null,
      display_name: null,
      avatar_url: null,
      preferences: {
        ...DEFAULT_PREFERENCES,
        defaultTimeSignature: { ...DEFAULT_PREFERENCES.defaultTimeSignature },
      },
      updated_at: null,
    };
  }

  const dbProfile = data;
  const storedPreferences = dbProfile.preferences as UserPreferences | null | undefined;

  return {
    id: dbProfile.id,
    username: dbProfile.username,
    display_name: dbProfile.display_name || null,
    avatar_url: dbProfile.avatar_url,
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...(storedPreferences ?? {}),
    },
    updated_at: dbProfile.updated_at,
  };
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>,
  supabaseParam?: SupabaseClient<Database>,
): Promise<UserProfile> {
  const supabase = getClient(supabaseParam);

  const updatePayload: Database['public']['Tables']['profiles']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (updates.username !== undefined) updatePayload.username = updates.username;
  if (updates.display_name !== undefined) updatePayload.display_name = updates.display_name;
  if (updates.avatar_url !== undefined) updatePayload.avatar_url = updates.avatar_url;
  if (updates.preferences !== undefined) {
    updatePayload.preferences =
      updates.preferences as Database['public']['Tables']['profiles']['Update']['preferences'];
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return getProfile(userId, supabase);
}

export async function updatePreferences(
  userId: string,
  updates: Partial<UserPreferences>,
  supabaseParam?: SupabaseClient<Database>,
): Promise<UserProfile> {
  const currentProfile = await getProfile(userId, supabaseParam);

  const newPreferences: UserPreferences = {
    ...currentProfile.preferences,
    ...updates,
  };

  return updateProfile(userId, { preferences: newPreferences }, supabaseParam);
}
