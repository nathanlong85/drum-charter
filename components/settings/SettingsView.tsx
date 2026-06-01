'use client';

import { Check, Loader2, Monitor, Moon, Sun, User } from 'lucide-react';
import { useState, useTransition } from 'react';
import { updateProfileAction } from '@/app/(app)/settings/actions';
import { useTheme } from '@/components/common/ThemeProvider';
import type { UserPreferences, UserProfile } from '@/lib/types/user';

interface SettingsViewProps {
  profile: UserProfile;
}

export default function SettingsView({ profile }: SettingsViewProps) {
  const { setTheme: setGlobalTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [theme, setTheme] = useState<UserPreferences['theme']>(
    profile.preferences.theme || 'system',
  );
  const [defaultNumerator, setDefaultNumerator] = useState(
    profile.preferences.defaultTimeSignature?.numerator || 4,
  );
  const [defaultDenominator, setDefaultDenominator] = useState(
    profile.preferences.defaultTimeSignature?.denominator || 4,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await updateProfileAction({
          display_name: displayName,
          username: username,
          preferences: {
            theme,
            defaultTimeSignature: {
              numerator: defaultNumerator,
              denominator: defaultDenominator,
            },
          },
        });

        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(true);
          // Apply theme immediately on client and set cookie
          setGlobalTheme(theme);
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Settings update error:', err);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1
          data-testid="settings-heading"
          className="text-3xl font-headline font-black text-on-surface uppercase tracking-tight mb-2"
        >
          Settings
        </h1>
        <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase opacity-60">
          Personalize your workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity Section */}
        <section className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
              Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="display_name"
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1"
              >
                Display Name
              </label>
              <input
                id="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="The Drummer"
                className="w-full bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl px-6 py-4 text-on-surface outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="groove_master"
                className="w-full bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl px-6 py-4 text-on-surface outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Sun className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
              Appearance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(
              [
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${
                  theme === option.id
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-surface-container-highest border-transparent text-on-surface-variant hover:bg-surface-bright'
                }`}
              >
                <option.icon className="w-6 h-6" />
                <span className="text-[10px] font-headline font-black uppercase tracking-widest">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Session Defaults Section */}
        <section className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-tertiary" />
            </div>
            <h2 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
              Session Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label
                htmlFor="default_numerator"
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1"
              >
                Default Time Signature
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="default_numerator"
                  type="number"
                  min="1"
                  max="32"
                  value={defaultNumerator}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val)) setDefaultNumerator(val);
                  }}
                  className="w-20 bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl px-4 py-4 text-on-surface text-center outline-none transition-all"
                />
                <span className="text-2xl font-headline font-black text-outline-variant">/</span>
                <select
                  id="default_denominator"
                  aria-label="Default Denominator"
                  value={defaultDenominator}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val)) setDefaultDenominator(val);
                  }}
                  className="w-20 bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl px-4 py-4 text-on-surface text-center outline-none transition-all appearance-none"
                >
                  {[2, 4, 8, 16].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-on-surface-variant/60 font-medium">
                New groove grids will be initialized with this signature.
              </p>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex-1">
            {error && (
              <p className="text-error text-[10px] font-headline font-black uppercase tracking-widest animate-shake">
                {error}
              </p>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-500 text-[10px] font-headline font-black uppercase tracking-widest animate-fade-in">
                <Check className="w-3 h-3" />
                Settings Updated Successfully
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-widest px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
