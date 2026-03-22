import { notFound, redirect } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { SongChart } from '@/lib/types/groove';
import { LiveModeViewContainer } from './LiveModeViewContainer';

interface LiveSongPageProps {
  params: Promise<{ id: string }>;
}

export default async function LiveSongPage({ params }: LiveSongPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let rawChart: SongChart;
  try {
    rawChart = await supabaseService.getSongChart(id, supabase);
  } catch (error: unknown) {
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

  return <LiveModeViewContainer chart={rawChart} />;
}
