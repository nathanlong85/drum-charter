'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { User } from '@supabase/supabase-js';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isGuest = user?.is_anonymous;

  if (loading)
    return (
      <div
        className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse border border-outline-variant/10"
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

  if (isGuest) {
    return (
      <div className="flex flex-col gap-3" data-testid="auth-status-guest">
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]"></div>
          <span
            className="text-[10px] font-headline font-black text-primary uppercase tracking-widest"
            data-testid="guest-mode-indicator"
          >
            Guest Mode
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant hover:text-error transition-colors px-1"
        >
          <LogOut size={12} />
          End Session
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface outline-none"
          data-testid="auth-user-avatar"
          aria-label="User profile menu"
        >
          <UserIcon size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-surface-container-highest rounded-xl border border-outline-variant/10 p-2 shadow-lg animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-50 mr-4 mt-2"
          align="end"
          sideOffset={8}
        >
          <div
            className="px-3 py-2 mb-2 flex flex-col min-w-0 border-b border-outline-variant/10 pb-3"
            data-testid="auth-user-email"
          >
            <span className="text-[10px] font-headline font-black text-on-surface uppercase tracking-tight truncate">
              {user.email || user.phone || 'No email provided'}
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
