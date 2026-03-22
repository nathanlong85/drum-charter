import Link from 'next/link';
import { AuthStatus } from '@/components/auth/AuthStatus';

export default function ManualPage() {
  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2 uppercase">
              User Manual
            </h1>
            <p className="text-zinc-500">Master the art of digital drum charting.</p>
          </div>
          <AuthStatus />
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-12">
          <div className="p-8 md:p-12 prose prose-zinc max-w-none prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12">
            <h2>Welcome to DrumCharter</h2>
            <p className="lead text-xl text-zinc-600">
              DrumCharter is a specialized tool designed by drummers, for drummers. It replaces
              cumbersome word processor templates with a streamlined, interactive environment for
              creating, managing, and performing with high-quality drum charts.
            </p>

            <h2>Core Features</h2>
            <ul>
              <li>
                <strong>Song Charts</strong>: Structured song documents with headers, sections
                (Verse, Chorus, etc.), and measure counts.
              </li>
              <li>
                <strong>Drum-Aware Groove Grid</strong>: A specialized sequencer that understands
                drum categories, symbols, and articulations.
              </li>
              <li>
                <strong>Setlists</strong>: Organize your songs into performance-ready lists.
              </li>
              <li>
                <strong>Live Mode</strong>: A high-contrast, distraction-free stage view optimized
                for performance.
              </li>
              <li>
                <strong>Notebooks</strong>: A flexible space for practice routines, sketches, and
                loose ideas.
              </li>
              <li>
                <strong>Offline Support (PWA)</strong>: Use DrumCharter even without an internet
                connection.
              </li>
            </ul>

            <h2>The Groove Grid</h2>
            <p>
              The heart of DrumCharter is the Groove Grid. Unlike generic sequencers, it is
              optimized for drum notation.
            </p>
            <h3>Adding Notes</h3>
            <p>
              Click any cell in the grid to toggle a drum hit. Each instrument (Kick, Snare, Hi-Hat,
              etc.) has its own row.
            </p>
            <h3>Articulations & Symbols</h3>
            <ul>
              <li>
                <strong>Standard Hit</strong>: A regular click.
              </li>
              <li>
                <strong>Accent</strong>: A louder, emphasized hit.
              </li>
              <li>
                <strong>Ghost Note</strong>: A soft, subtle tap.
              </li>
              <li>
                <strong>Articulations</strong>: Specific hits like Rim Shots, Cross Sticks, Cymbal
                Bells, and Chokes.
              </li>
            </ul>
            <h3>Rapid Editing (Keyboard Shortcuts)</h3>
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 border-b border-zinc-200">Shortcut</th>
                  <th className="py-2 border-b border-zinc-200">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="py-2 border-b border-zinc-100 font-mono">Shift + Click</td>
                  <td className="py-2 border-b border-zinc-100">
                    Toggle "Optional" status (ghosted in UI)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 border-b border-zinc-100 font-mono">Alt + Click</td>
                  <td className="py-2 border-b border-zinc-100">
                    Open Symbol Picker for specific articulations
                  </td>
                </tr>
                <tr>
                  <td className="py-2 border-b border-zinc-100 font-mono">Drag across cells</td>
                  <td className="py-2 border-b border-zinc-100">
                    Multi-select cells for batch operations
                  </td>
                </tr>
                <tr>
                  <td className="py-2 border-b border-zinc-100 font-mono">Delete / Backspace</td>
                  <td className="py-2 border-b border-zinc-100">Clear selected cells</td>
                </tr>
              </tbody>
            </table>

            <h2>Live Mode & Remote Control</h2>
            <p>Enter Live Mode from any Song Chart or Setlist to get a high-contrast stage view.</p>
            <h3>Navigation</h3>
            <ul>
              <li>
                Use the <strong>Arrow Keys</strong> or <strong>Page Up/Down</strong> to navigate
                between song sections.
              </li>
              <li>
                Press <strong>F</strong> to toggle Fullscreen mode.
              </li>
              <li>
                Press <strong>ESC</strong> to exit Live Mode.
              </li>
            </ul>
            <h3>Pedal & MIDI Support</h3>
            <p>
              DrumCharter supports Bluetooth page-turner pedals (like AirTurn) and MIDI controllers
              for hands-free operation.
            </p>
            <ol>
              <li>
                Open the <strong>Remote Control Settings</strong> (gear icon) in Live Mode.
              </li>
              <li>
                Click <strong>Map</strong> next to an action (e.g., "Next Section").
              </li>
              <li>Press your pedal or trigger a MIDI note/button.</li>
              <li>The mapping is saved automatically to your device.</li>
            </ol>

            <h2>Managing Your Library</h2>
            <p>
              All your creations are stored in <strong>My Library</strong>. You can search by title
              or filter by tags (e.g., "Worship", "Funk", "Practice").
            </p>
            <ul>
              <li>
                <strong>Duplicate</strong>: Create a copy of any item to use as a template.
              </li>
              <li>
                <strong>Delete</strong>: Remove items permanently from your library.
              </li>
              <li>
                <strong>Public/Private</strong>: Toggle the visibility of your charts. Public charts
                can be shared via a unique URL.
              </li>
            </ul>

            <h2>Troubleshooting</h2>
            <h3>No Sound?</h3>
            <p>
              Browsers often block audio until you interact with the page. If you don't hear
              anything, try clicking anywhere on the screen or toggling the playback button.
            </p>
            <h3>MIDI Device Not Working?</h3>
            <p>
              Ensure your device is connected before opening the browser. You may need to refresh
              the page or check your browser's site permissions to allow "MIDI devices".
            </p>
            <h3>Offline Use?</h3>
            <p>
              On supported browsers, you can "Install" DrumCharter as an app. This ensures all your
              charts and the audio engine are available even when you have no signal.
            </p>
          </div>
        </div>

        <footer className="text-center pb-12">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors uppercase tracking-widest text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to My Library
          </Link>
        </footer>
      </div>
    </main>
  );
}
