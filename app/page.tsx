import { Music } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { MarketingHero } from '@/components/home/MarketingHero';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-surface font-body selection:bg-primary/30 selection:text-primary transition-colors overflow-x-hidden">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
          >
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_var(--color-primary-dim)] group-hover:scale-110 transition-transform duration-500">
              <Music className="w-6 h-6 text-on-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-headline font-black tracking-tighter text-on-surface uppercase">
                DrumCharter
              </span>
              <span className="text-[9px] font-headline font-bold tracking-[0.3em] text-primary uppercase mt-0.5">
                Drum Charting for Professionals
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <a href="#features" className="hover:text-primary transition-colors">
                Features
              </a>
              <a href="#demo" className="hover:text-primary transition-colors">
                Live Demo
              </a>
              <Link href="/manual" className="hover:text-primary transition-colors">
                Manual
              </Link>
            </nav>
            <div className="h-6 w-px bg-outline-variant/20 hidden md:block"></div>
            <AuthStatus />
          </div>
        </div>
      </header>

      <MarketingHero />

      {/* Footer */}
      <footer className="py-20 bg-surface px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-lg">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-headline font-black tracking-tighter text-on-surface uppercase">
                DrumCharter
              </span>
            </div>
            <p className="text-xs font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} DrumCharter v1.0-alpha
            </p>
          </div>

          <nav className="flex gap-12 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
            <Link href="/manual#privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/manual#terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/nathanlong85/drum-charter"
              target="_blank"
              className="hover:text-primary transition-colors"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
