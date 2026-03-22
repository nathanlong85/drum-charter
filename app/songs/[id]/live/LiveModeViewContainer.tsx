'use client';

import { useRouter } from 'next/navigation';
import { LiveModeView } from '@/components/chart/LiveModeView';
import type { SongChart } from '@/lib/types/groove';

interface LiveModeViewContainerProps {
  chart: SongChart;
}

export function LiveModeViewContainer({ chart }: LiveModeViewContainerProps) {
  const router = useRouter();

  return <LiveModeView chart={chart} onExit={() => router.push(`/songs/${chart.id}`)} />;
}
