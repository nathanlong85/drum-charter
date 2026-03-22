'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { SongChart } from '@/lib/types/groove';
import { GrooveGridEditor } from '../groove/GrooveGridEditor';

interface LiveModeViewProps {
  chart: SongChart;
  onExit: () => void;
}

export const LiveModeView: React.FC<LiveModeViewProps> = ({ chart, onExit }) => {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeSection = chart.sections[activeSectionIdx];

  const nextSection = useCallback(() => {
    setActiveSectionIdx((prev) => Math.min(prev + 1, chart.sections.length - 1));
  }, [chart.sections.length]);

  const prevSection = useCallback(() => {
    setActiveSectionIdx((prev) => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSection();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSection();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onExit();
        }
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSection, prevSection, onExit, toggleFullscreen]);

  if (!activeSection) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-yellow-400">
        <p className="text-2xl font-bold">No sections found in this chart.</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black text-white flex flex-col font-sans"
      data-testid="live-mode-view"
      id="live-mode-view-root"
    >
      {/* Header */}
      <header className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-yellow-400">
            {chart.header.title}
          </h1>
          <div className="flex gap-4 mt-1 text-zinc-400 font-mono text-sm uppercase">
            <span>BPM: {chart.header.bpm || 'N/A'}</span>
            <span>
              {chart.header.timeSignature.beatsPerMeasure}/{chart.header.timeSignature.beatValue}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleFullscreen}
            data-testid="live-mode-fullscreen-btn"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-bold uppercase transition-colors border border-zinc-700"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
          </button>
          <button
            onClick={onExit}
            data-testid="exit-live-mode-btn"
            className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded text-sm font-bold uppercase transition-colors border border-red-800"
          >
            Exit Live Mode
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-end mb-8 border-b-4 border-yellow-400 pb-4">
            <h2 className="text-6xl font-black uppercase text-white leading-none">
              {activeSection.name}
            </h2>
            <div className="text-4xl font-mono text-zinc-500 font-bold">
              {activeSectionIdx + 1} / {chart.sections.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {activeSection.grid && (
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
                <GrooveGridEditor initialGrid={activeSection.grid} readOnly />
              </div>
            )}

            {activeSection.notes && activeSection.notes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-yellow-400 uppercase tracking-widest">
                  Performance Notes
                </h3>
                <ul className="space-y-3">
                  {activeSection.notes.map((note, idx) => (
                    <li key={idx} className="text-3xl font-medium text-zinc-200 flex gap-4">
                      <span className="text-yellow-400">›</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSection.subSections && activeSection.subSections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeSection.subSections.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800"
                  >
                    <h4 className="text-2xl font-bold text-white mb-4 uppercase">
                      {sub.name} ({sub.measuresCount}M)
                    </h4>
                    {sub.grid && <GrooveGridEditor initialGrid={sub.grid} readOnly />}
                    {sub.notes && sub.notes.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {sub.notes.map((n, i) => (
                          <li key={i} className="text-xl text-zinc-400 flex gap-2">
                            <span className="text-yellow-600">▪</span> {n}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="p-6 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center">
        <button
          disabled={activeSectionIdx === 0}
          onClick={prevSection}
          className="flex items-center gap-4 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-zinc-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-50">
              Previous
            </div>
            <div className="text-lg font-bold uppercase">
              {activeSectionIdx > 0 ? chart.sections[activeSectionIdx - 1].name : 'Start'}
            </div>
          </div>
        </button>

        <div className="flex gap-2">
          {chart.sections.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === activeSectionIdx ? 'w-8 bg-yellow-400' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <button
          disabled={activeSectionIdx === chart.sections.length - 1}
          onClick={nextSection}
          className="flex items-center gap-4 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors group text-right"
        >
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Next</div>
            <div className="text-lg font-bold uppercase text-yellow-400">
              {activeSectionIdx < chart.sections.length - 1
                ? chart.sections[activeSectionIdx + 1].name
                : 'End'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-zinc-800 border-yellow-400 text-yellow-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </footer>
    </div>
  );
};
