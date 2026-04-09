'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { User } from '@supabase/supabase-js';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/user';

export interface AuthStatusProps {
  initialUser?: User | null;
  initialProfile?: UserProfile | null;
}

export function AuthStatus({ initialUser = null, initialProfile = null }: AuthStatusProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialUser && !initialProfile);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // If we have initial user/profile, we can skip the first fetch
    if (initialUser || initialProfile) {
      setLoading(false);
    }

    const getUser = async () => {
      // If we already have a user, only re-fetch if needed (e.g., to get fresh profile)
      // but onAuthStateChange handles updates usually.
      if (!initialUser) {
        try {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();

          if (!mounted) return;
          setUser(currentUser);

          if (currentUser) {
            const profileData = await supabaseService.getProfile(currentUser.id, supabase);
            if (mounted) setProfile(profileData);
          }
        } catch (err) {
          console.error('Error fetching user or profile:', err);
          if (mounted) setUser(null);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        if (mounted) setLoading(false);
        try {
          const profileData = await supabaseService.getProfile(newUser.id, supabase);
          if (mounted) {
            setProfile(profileData);
          }
        } catch (err) {
          console.error('Error fetching profile on auth change:', err);
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialProfile, initialUser]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Use window.location for a full refresh to clear all client-side state
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, [supabase.auth]);

  if (loading)
    return (
      <div
        className="w-10 h-10 rounded-full bg-surface-container-highest animate-pulse border border-outline-variant/10"
        role="status"
        aria-label="Loading user profile"
      >
        <span className="sr-only">Loading user profile</span>
      </div>
    );

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <a
          href="/login"
          className="w-full bg-primary text-on-primary font-headline font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-center"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface outline-none border border-primary/20"
          data-testid="auth-user-avatar"
          aria-label="User profile menu"
        >
          {profile?.avatar_url ? (
            <div className="w-full h-full relative p-0.5">
              <Image
                src={profile.avatar_url}
                alt=""
                fill
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <UserIcon size={20} strokeWidth={2.5} />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-surface-container-highest rounded-xl border border-outline-variant/20 p-2 shadow-xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-[100]"
          align="end"
          sideOffset={12}
        >
          <div
            className="px-3 py-2 mb-2 flex flex-col min-w-0 border-b border-outline-variant/10 pb-3"
            data-testid="auth-user-email"
          >
            <span className="text-[10px] font-headline font-black text-on-surface uppercase tracking-tight truncate">
              {profile?.display_name ||
                profile?.username ||
                user.email ||
                user.phone ||
                'No email provided'}
            </span>
            {user.app_metadata?.tier === 'pro' ? (
              <span className="text-[8px] font-headline font-bold text-primary uppercase tracking-widest mt-1">
                PRO ACCOUNT
              </span>
            ) : user.app_metadata?.tier === 'basic' ? (
              <span className="text-[8px] font-headline font-bold text-on-surface-variant uppercase tracking-widest opacity-50 mt-1">
                BASIC ACCOUNT
              </span>
            ) : null}
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-[10px] font-headline font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer outline-none focus:bg-surface-container focus:text-on-surface"
            >
              <Settings size={14} />
              Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-outline-variant/10 my-1" />

          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-headline font-bold text-error/80 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer outline-none focus:bg-error/10 focus:text-error"
          >
            <LogOut size={14} />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
