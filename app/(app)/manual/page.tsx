import {
  ArrowLeft,
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  Music,
  PlayCircle,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function ManualPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <div className="flex items-center gap-3 text-primary font-headline text-xs font-bold uppercase tracking-[0.3em] mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-headline font-black tracking-tighter text-on-surface uppercase mb-2">
            User Manual
          </h2>
          <p className="text-on-surface-variant font-headline text-xs tracking-[0.3em] uppercase max-w-md">
            Master the architecture of rhythm and digital notation.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.2em] mb-4 px-4">
              Sections
            </p>
            {[
              { id: 'welcome', label: 'Welcome', icon: Zap },
              { id: 'features', label: 'Core Features', icon: Layers },
              { id: 'grid', label: 'Groove Grid', icon: Music },
              { id: 'live', label: 'Live Mode', icon: PlayCircle },
              { id: 'library', label: 'Library', icon: Settings },
              { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
              { id: 'terms', label: 'Terms', icon: FileText },
              { id: 'trouble', label: 'Troubleshooting', icon: HelpCircle },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-xl transition-all font-headline font-bold text-sm uppercase tracking-tight"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-20 pb-24">
          <section id="welcome" className="scroll-mt-24">
            <div className="bg-surface-container-low p-8 md:p-12 rounded-[32px] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <h3 className="text-3xl font-headline font-black text-on-surface uppercase tracking-tight mb-6">
                Welcome to DrumCharter
              </h3>
              <p className="text-xl text-on-surface-variant leading-relaxed font-body">
                DrumCharter is a high-fidelity workspace designed by drummers, for drummers. It
                replaces cumbersome word processors with an architectural environment for creating,
                managing, and performing with professional-grade drum charts.
              </p>
            </div>
          </section>

          <section id="features" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              Core Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Song Charts',
                  desc: 'Structured documents with dynamic sections and measure counts.',
                },
                {
                  title: 'Groove Grid',
                  desc: 'A drum-aware sequencer with support for ghost notes and articulations.',
                },
                {
                  title: 'Setlists',
                  desc: 'Perform-ready collections for seamless gig transitions.',
                },
                {
                  title: 'Live Mode',
                  desc: 'A distraction-free, high-contrast stage view for tablet use.',
                },
                {
                  title: 'Notebooks',
                  desc: 'Modular scratchpads for practice routines and technical sketches.',
                },
                {
                  title: 'Offline-First',
                  desc: 'Full PWA support allows charting without an active connection.',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10"
                >
                  <h4 className="font-headline font-black text-primary uppercase tracking-widest text-xs mb-2">
                    {f.title}
                  </h4>
                  <p className="text-on-surface-variant text-sm font-body">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="grid" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              The Groove Grid
            </h3>
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-on-surface-variant font-body leading-relaxed">
                The heart of DrumCharter is the Groove Grid—an interactive canvas optimized for drum
                notation.
              </p>

              <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10">
                <table className="min-w-full text-left font-headline">
                  <thead className="bg-surface-container-highest/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Shortcut
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {[
                      { key: 'Shift + Click', action: 'Toggle "Optional" status (ghosted in UI)' },
                      {
                        key: 'Alt + Click',
                        action: 'Open Symbol Picker for specific articulations',
                      },
                      { key: 'Drag Selection', action: 'Multi-select cells for batch operations' },
                      { key: 'Delete / Back', action: 'Clear selected cells' },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-surface-container-highest/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                          {row.key}
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="live" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              Performance & MIDI
            </h3>
            <div className="bg-surface-container p-8 rounded-[32px] border border-outline-variant/10 space-y-6">
              <div className="space-y-4 font-body">
                <h4 className="text-lg font-headline font-bold text-on-surface uppercase">
                  Remote Control Integration
                </h4>
                <p className="text-on-surface-variant">
                  DrumCharter supports Bluetooth foot switches and MIDI controllers for hands-free
                  navigation.
                </p>
                <ol className="list-decimal list-inside space-y-3 text-on-surface-variant text-sm">
                  <li>
                    Enter{' '}
                    <strong className="text-primary uppercase tracking-tighter">Live Mode</strong>{' '}
                    from any chart.
                  </li>
                  <li>
                    Click the gear icon to open{' '}
                    <strong className="text-on-surface">Remote Control Settings</strong>.
                  </li>
                  <li>
                    Tap <strong className="text-primary">Map</strong> and trigger your external
                    controller.
                  </li>
                  <li>Mappings are persisted locally to your device.</li>
                </ol>
              </div>
            </div>
          </section>

          <section id="library" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              Managing Your Library
            </h3>
            <div className="bg-surface-container p-8 rounded-[32px] border border-outline-variant/10 space-y-6 font-body text-on-surface-variant leading-relaxed">
              <p>
                All your creations are stored in <strong>My Library</strong>. You can search by
                title or filter by tags (e.g., &quot;Rock&quot;, &quot;Practice&quot;).
              </p>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <h4 className="text-primary font-headline font-black uppercase text-[10px] tracking-widest mb-2">
                    Duplicate
                  </h4>
                  <p className="text-xs">
                    Create a copy of any item to use as a template for new variations.
                  </p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <h4 className="text-error font-headline font-black uppercase text-[10px] tracking-widest mb-2">
                    Delete
                  </h4>
                  <p className="text-xs">Remove items permanently from your cloud repository.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="trouble" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              Troubleshooting
            </h3>
            <div className="bg-surface-container p-8 rounded-[32px] border border-outline-variant/10 space-y-6 font-body text-on-surface-variant leading-relaxed">
              <div className="space-y-4">
                <h4 className="text-on-surface font-headline font-bold uppercase text-sm">
                  No Sound?
                </h4>
                <p className="text-sm">
                  Browsers often block audio until you interact with the page. If you don&apos;t
                  hear anything, try clicking anywhere or toggling the playback button.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-on-surface font-headline font-bold uppercase text-sm">
                  MIDI Not Working?
                </h4>
                <p className="text-sm">
                  Ensure your device is connected before opening the browser. You may need to
                  refresh or check site permissions for &quot;MIDI devices&quot;.
                </p>
              </div>
            </div>
          </section>

          <section id="privacy" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              Privacy Policy
            </h3>
            <div className="bg-surface-container p-8 rounded-[32px] border border-outline-variant/10 space-y-4 font-body text-on-surface-variant leading-relaxed">
              <p>
                DrumCharter is designed with a privacy-first architecture. Your data is stored
                securely in our cloud repository via Supabase.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>We do not sell your musical data or personal identity.</li>
                <li>Public charts are only visible to those with the unique architect URL.</li>
              </ul>
            </div>
          </section>

          <section id="terms" className="scroll-mt-24 space-y-8">
            <h3 className="text-2xl font-headline font-black text-on-surface uppercase tracking-[0.2em] border-l-4 border-primary pl-6">
              Terms of Service
            </h3>
            <div className="bg-surface-container p-8 rounded-[32px] border border-outline-variant/10 space-y-4 font-body text-on-surface-variant leading-relaxed">
              <p>
                By initializing the Sonic Architect Console, you agree to the following protocols:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Usage is intended for percussive notation and musical study.</li>
                <li>We provide the architecture &quot;as-is&quot; during this alpha phase.</li>
                <li>Ownership of all rhythms and charts remains with the architect.</li>
              </ul>
            </div>
          </section>

          <footer className="pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <Link
              href="/library"
              className="flex items-center gap-3 bg-surface-container-highest text-on-surface-variant px-6 py-3 rounded-full font-headline font-bold uppercase tracking-widest text-[10px] hover:text-primary hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Library
            </Link>
            <p className="text-[10px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-[0.4em]">
              DrumCharter Documentation v1.0-alpha
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
