'use client';

import { ArrowLeft, Lock, Mail, Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('error');

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
    if (loading) return;
    setLoading(true);
    setMessage('');
    setMessageType('error');

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
      setMessageType('success');
      setMessage('Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4"></div>

      <div className="flex-1 flex flex-col w-full px-6 sm:max-w-md justify-center mx-auto relative z-10">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-[0_0_25px_var(--color-primary-dim)] group-hover:scale-110 transition-transform duration-500">
              <Music className="w-7 h-7 text-on-primary" />
            </div>
          </Link>
          <h1 className="text-4xl font-headline font-black tracking-tighter text-on-surface uppercase mb-2">
            Access Console
          </h1>
          <p className="text-on-surface-variant font-headline text-[10px] tracking-[0.3em] uppercase opacity-60">
            Initialize your sonic architecture
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 shadow-2xl shadow-black/20">
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1"
                htmlFor="email"
              >
                Email Identity
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="w-full bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl pl-12 pr-4 py-4 text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all"
                  name="email"
                  placeholder="name@studio.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1"
                htmlFor="password"
              >
                Security Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  className="w-full bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl pl-12 pr-4 py-4 text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                className="w-full bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Authenticate'}
              </button>
              <button
                onClick={handleSignup}
                className="w-full bg-surface-container-highest text-on-surface font-headline font-black text-xs uppercase tracking-widest py-4 rounded-2xl border border-outline-variant/10 hover:bg-surface-bright transition-all disabled:opacity-50"
                disabled={loading}
                type="button"
              >
                Create Account
              </button>
            </div>
          </form>

          {message && (
            <div
              role="status"
              aria-live={messageType === 'error' ? 'assertive' : 'polite'}
              aria-atomic="true"
              className={`mt-6 p-4 border rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest text-center animate-shake ${
                messageType === 'error'
                  ? 'bg-error/10 border-error/20 text-error'
                  : 'bg-green-500/10 border-green-500/20 text-green-500'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-headline font-black text-on-surface-variant hover:text-primary uppercase tracking-[0.2em] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
