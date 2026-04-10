import { notFound, redirect } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { SongChart } from '@/lib/types/groove';
import { LiveModeViewContainer } from './LiveModeViewContainer';

interface LiveSongPageProps {
  params: Promise<{ id: string }>;
}

export default async function LiveSongPage({ params }: LiveSongPageProps) {
  const [{ id }, supabase] = await Promise.all([params, createClient()]);

  const [authResult, rawChartResult] = await Promise.allSettled([
    supabase.auth.getUser(),
    supabaseService.getSongChart(id, supabase),
  ]);

  if (authResult.status === 'rejected' || !authResult.value.data.user) {
    redirect('/login');
  }

  if (rawChartResult.status === 'rejected') {
    const error = rawChartResult.reason;
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    throw error;
  }

  const rawChart = rawChartResult.value;

  return <LiveModeViewContainer chart={rawChart} />;
}
