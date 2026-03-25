'use client';

import type { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
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
      <div className="text-[10px] font-headline font-black text-on-surface-variant uppercase tracking-widest animate-pulse">
        Loading auth...
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
    <div className="flex flex-col gap-3" data-testid="auth-status-user">
      <div className="flex items-center gap-3 px-3 py-2 bg-surface-container-highest rounded-xl border border-outline-variant/10">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <UserIcon size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[10px] font-headline font-black text-on-surface uppercase tracking-tight truncate"
            data-testid="auth-user-email"
          >
            {user.email}
          </span>
          {/* TODO: Drive this from user account metadata when available */}
          <span className="text-[8px] font-headline font-bold text-on-surface-variant uppercase tracking-widest opacity-50">
            PRO ACCOUNT
          </span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant hover:text-error transition-colors px-1"
      >
        <LogOut size={12} />
        Sign Out
      </button>
    </div>
  );
}
