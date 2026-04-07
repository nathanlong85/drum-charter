'use client';

import type { User } from '@supabase/supabase-js';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  Library as LibraryIcon,
  ListMusic,
  Loader2,
  Music,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useState } from 'react';
import { LibraryCard } from '@/components/library/LibraryCard';
import { createItemAction } from '@/lib/actions/item-actions';
import type { RecentItem } from '@/lib/types/dashboard';
import type { UserProfile } from '@/lib/types/user';

interface DashboardViewProps {
  user: User;
  profile: UserProfile | null;
  recentItems: RecentItem[];
}

export function DashboardView({ user, profile, recentItems }: DashboardViewProps) {
  const _router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = async (type: 'song' | 'notebook' | 'snippet') => {
    setIsCreating(true);
    // Note: We don't use try/catch here because createItemAction performs a redirect,
    // which throws a special NEXT_REDIRECT error that should not be caught on the client.
    const defaultTimeSig = profile?.preferences?.defaultTimeSignature || {
      numerator: 4,
      denominator: 4,
    };

    await createItemAction(type, defaultTimeSig);
  };

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, _href: string) => {
    if (isCreating) {
      e.preventDefault();
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Banner */}
      <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface uppercase tracking-tight">
            Mission <span className="text-primary">Control</span>
          </h1>
          <p className="text-on-surface-variant font-body mt-2">
            Welcome back,{' '}
            {profile?.display_name || profile?.username || user.email?.split('@')[0] || 'Drummer'}.
            Your workspace is ready.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Starts & Nav */}
        <div className="lg:col-span-1 space-y-8">
          {/* Quick Starts */}
          <section className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 shadow-sm relative overflow-hidden">
            {isCreating && (
              <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-headline font-black text-on-surface uppercase tracking-wider">
                Quick Start
              </h2>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCreateNew('song')}
                disabled={isCreating}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-headline text-xs font-black tracking-widest uppercase px-6 py-4 rounded-2xl transition-colors flex items-center gap-4 group"
              >
                <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Music className="w-4 h-4" />
                </div>
                New Song Chart
              </button>
              <button
                type="button"
                onClick={() => handleCreateNew('snippet')}
                disabled={isCreating}
                className="w-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline text-xs font-black tracking-widest uppercase px-6 py-4 rounded-2xl transition-colors flex items-center gap-4 group"
              >
                <div className="bg-outline-variant/20 p-2 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <LibraryIcon className="w-4 h-4" />
                </div>
                New Groove Snippet
              </button>
              <button
                type="button"
                onClick={() => handleCreateNew('notebook')}
                disabled={isCreating}
                className="w-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline text-xs font-black tracking-widest uppercase px-6 py-4 rounded-2xl transition-colors flex items-center gap-4 group"
              >
                <div className="bg-outline-variant/20 p-2 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                New Practice Notebook
              </button>
            </div>
          </section>

          {/* Quick Nav */}
          <section className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-tertiary" />
              <h2 className="text-lg font-headline font-black text-on-surface uppercase tracking-wider">
                Navigation
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/library"
                onClick={(e) => handleLinkClick(e, '/library')}
                className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <LibraryIcon className="w-6 h-6 text-on-surface-variant group-hover:text-primary mb-2 transition-colors" />
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">
                  Library
                </span>
              </Link>
              <Link
                href="/setlists"
                onClick={(e) => handleLinkClick(e, '/setlists')}
                className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <ListMusic className="w-6 h-6 text-on-surface-variant group-hover:text-primary mb-2 transition-colors" />
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">
                  Setlists
                </span>
              </Link>
              <Link
                href="/manual"
                onClick={(e) => handleLinkClick(e, '/manual')}
                className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all group col-span-2"
              >
                <BookOpen className="w-6 h-6 text-on-surface-variant group-hover:text-primary mb-2 transition-colors" />
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">
                  User Manual
                </span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2">
          <section className="h-full bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/10 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-headline font-black text-on-surface uppercase tracking-wider">
                  Recent Activity
                </h2>
              </div>
              <Link
                href="/library"
                onClick={(e) => handleLinkClick(e, '/library')}
                className="text-xs font-headline font-bold uppercase tracking-widest text-primary hover:text-primary-dim transition-colors flex items-center gap-2"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentItems && recentItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentItems.map((item) => (
                  <LibraryCard
                    key={item.id}
                    item={{
                      id: item.id,
                      title: item.title || 'Untitled',
                      type: item.type,
                      bpm: item.bpm,
                      createdAt: item.updatedAt || item.createdAt || '1970-01-01T00:00:00.000Z',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
                  <LibraryIcon className="w-8 h-8 text-on-surface-variant/50" />
                </div>
                <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
                  No Recent Activity
                </h3>
                <p className="text-on-surface-variant font-body text-sm max-w-sm">
                  Your workspace is empty. Create a new song chart, groove snippet, or practice
                  notebook to get started.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
