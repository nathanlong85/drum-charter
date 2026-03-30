'use client';

import { ArrowRight, Cloud, Layers, Music, Play, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { TooltipProvider } from '@/components/common/Tooltip';
import { GrooveDemo } from '@/components/demo/GrooveDemo';

const ACCENT_CLASS_MAP: Record<string, string> = {
  primary: 'text-primary',
  tertiary: 'text-tertiary',
};

export default function Home() {
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
                Sonic Architect
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <a href="#features" className="hover:text-primary transition-colors">
                Features
              </a>
              <a href="#demo" className="hover:text-primary transition-colors">
                Live Engine
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

      {/* Cinematic Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-highest/50 rounded-full border border-outline-variant/10 mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
              V1.0 ALPHA REDESIGN NOW LIVE
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black text-on-surface mb-8 tracking-tight uppercase leading-[0.9]">
            The Workspace <br />
            <span className="bg-gradient-to-r from-primary to-primary-dim bg-clip-text text-transparent">
              Built For Rhythm.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant mb-12 leading-relaxed max-w-3xl mx-auto font-body">
            Orchestrate complex song charts, modular practice routines, and high-fidelity groove
            libraries. A DAW-inspired environment for the modern percussionist.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <Link
              href="/login"
              className="group relative px-10 py-5 bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1"
            >
              <span className="flex items-center gap-3">
                Start Creating (Guest Mode)
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/library"
              className="px-10 py-5 bg-surface-container-highest text-on-surface font-headline font-black text-xs uppercase tracking-widest rounded-2xl border border-outline-variant/20 hover:bg-surface-bright transition-all"
            >
              Access Library
            </Link>
          </div>
          {/* Interactive Engine Preview */}
          <div
            id="demo"
            className="relative group p-1 bg-gradient-to-br from-outline-variant/20 to-transparent rounded-[40px] scroll-mt-24"
          >
            <div className="bg-surface-container-low rounded-[38px] p-4 md:p-8 shadow-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="h-4 w-px bg-outline-variant/20 mx-2"></div>
                  <span className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.3em]">
                    Live Audio Engine
                  </span>
                </div>
                <div className="flex items-center gap-3 px-3 py-1 bg-surface-container-highest rounded-lg text-[9px] font-headline font-bold text-on-surface-variant">
                  <RefreshCw className="w-3 h-3 animate-spin-slow" />
                  REAL-TIME SYNC
                </div>
              </div>
              <TooltipProvider>
                <GrooveDemo />
              </TooltipProvider>
            </div>
          </div>{' '}
        </div>
      </section>

      {/* Tech Stack / Features Grid */}
      <section
        id="features"
        className="py-32 relative bg-surface-container-lowest border-y border-outline-variant/10 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface uppercase tracking-tight mb-6">
                Modular Architectural <br />
                <span className="text-primary">Design Systems.</span>
              </h2>
              <p className="text-lg text-on-surface-variant font-body">
                DrumCharter isn&apos;t just a charting tool. It&apos;s a scalable infrastructure for
                your entire musical repertoire.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/10 w-24">
                <Cloud className="w-6 h-6 text-primary mb-2" />
                <span className="text-[8px] font-headline font-black text-on-surface-variant uppercase tracking-widest">
                  Cloud
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/10 w-24">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-[8px] font-headline font-black text-on-surface-variant uppercase tracking-widest">
                  Safe
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'High-Fidelity Charts',
                desc: 'Structured song documents with dynamic sections, measure counts, and integrated performance notes.',
                icon: Layers,
                accent: 'primary',
              },
              {
                title: 'Drum-Aware Engine',
                desc: 'A specialized sequencer that understands ghost notes, rimshots, and complex percussive articulations.',
                icon: Music,
                accent: 'tertiary',
              },
              {
                title: 'Stage-Ready Performance',
                desc: 'Enter Live Mode for a distraction-free, high-contrast interface optimized for tablets and MIDI control.',
                icon: Play,
                accent: 'primary',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-surface rounded-[32px] border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 bg-surface-container-highest flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className={`w-7 h-7 ${ACCENT_CLASS_MAP[feature.accent]}`} />
                </div>
                <h3 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight mb-4">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant leading-relaxed font-body text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              © {new Date().getFullYear()} Sonic Architect Console v1.0-alpha
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
