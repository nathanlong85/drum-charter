'use server';

import { revalidatePath } from 'next/cache';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/types/user';

export async function updateProfileAction(updates: Partial<UserProfile>) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  try {
    const profileUpdates = {
      ...updates,
      username: updates.username === '' ? null : updates.username,
    };
    await supabaseService.updateProfile(user.id, profileUpdates, supabase);
    revalidatePath('/settings');
    revalidatePath('/'); // Dashboard might use this data
    return { success: true };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.code === '23505') {
      return { error: 'Username is already taken' };
    }
    return { error: 'Failed to update profile' };
  }
}
