'use client';

import { AuthStatus } from '@/components/auth/AuthStatus';
import { GrooveDemo } from '@/components/demo/GrooveDemo';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Header/Nav */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-xl">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              DrumCharter
            </span>
          </div>
          <div className="flex items-center gap-4">
            <AuthStatus />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-zinc-50 mb-6 tracking-tight">
            Drum Charts That{' '}
            <span className="text-blue-600 dark:text-blue-500">Work Like You Do.</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Create interactive song charts, practice routines, and groove libraries in minutes. No
            more rigid templates. Just the rhythms you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/20 hover:-translate-y-0.5"
            >
              Start Creating (Guest Mode)
            </a>
            <a
              href="/library"
              className="px-8 py-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-700 font-bold rounded-xl hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
            >
              View My Library
            </a>
          </div>

          {/* Live Demo Container */}
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-full -z-10" />
            <GrooveDemo />
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-24 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Song Charts */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Song Charts</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Structure performance-ready documents with BPM, sections, and integrated groove
                grids.
              </p>
            </div>

            {/* Practice Notebooks */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Practice Notebooks
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Flexible routines for technical drills, brainstorming, and technical exercises.
              </p>
            </div>

            {/* Groove Snippets */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Groove Snippets
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                A searchable repository of individual fills and beats to reuse across your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} DrumCharter. Built for drummers, by drummers.
          </p>
        </div>
      </footer>
    </main>
  );
}
