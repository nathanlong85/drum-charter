'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      router.push('/library');
      router.refresh();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      setMessage(`Error: ${error.message}`);
      setGuestLoading(false);
    } else {
      router.push('/library');
      router.refresh();
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        onSubmit={handleLogin}
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-600 rounded-md px-4 py-2 text-white mb-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sign In'}
        </button>
        <button
          onClick={handleSignup}
          className="border border-blue-600 rounded-md px-4 py-2 text-blue-600 mb-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
          disabled={loading}
          type="button"
        >
          Sign Up
        </button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
              Or
            </span>
          </div>
        </div>
        <button
          onClick={handleGuestSignIn}
          className="w-full bg-zinc-900 text-white rounded-md px-4 py-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={loading || guestLoading}
          type="button"
        >
          {guestLoading ? 'Starting session...' : 'Continue as Guest'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>
        {message && (
          <p className="mt-4 p-4 bg-zinc-100 text-zinc-900 text-center rounded">{message}</p>
        )}
      </form>
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
