'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { type RemoteAction, useRemoteControl } from '@/lib/hooks/useRemoteControl';
import type { SongChart } from '@/lib/types/groove';
import { GrooveGridEditor } from '../groove/GrooveGridEditor';
import { RemoteControlSettings } from './RemoteControlSettings';

interface LiveModeViewProps {
  chart: SongChart;
  onExit: () => void;
}

// Z-index scale for Live Mode
const Z_INDEX = {
  BASE: 'z-[10000]',
  TRANSITION: 'z-[10010]',
  PROGRESS_FULLSCREEN: 'z-[10020]',
};

export const LiveModeView: React.FC<LiveModeViewProps> = ({ chart, onExit }) => {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSection = chart.sections[activeSectionIdx];

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const triggerTransition = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setIsTransitioning(true);
    // Sync with CSS transition duration (300ms + padding)
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  const nextSection = useCallback(() => {
    setActiveSectionIdx((prev) => Math.min(prev + 1, chart.sections.length - 1));
  }, [chart.sections.length]);

  const prevSection = useCallback(() => {
    setActiveSectionIdx((prev) => Math.max(prev - 1, 0));
  }, []);

  // Trigger transition when activeSectionIdx changes (but not on initial mount)
  const isFirstMount = React.useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    // We use activeSectionIdx as a trigger for transition
    if (typeof activeSectionIdx === 'number') {
      triggerTransition();
    }
  }, [activeSectionIdx, triggerTransition]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleExit = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error('Error exiting fullscreen on close:', err);
      }
    }
    onExit();
  }, [onExit]);

  const handleRemoteAction = useCallback(
    (action: RemoteAction) => {
      switch (action) {
        case 'next_section':
          nextSection();
          break;
        case 'prev_section':
          prevSection();
          break;
        case 'toggle_fullscreen':
          toggleFullscreen();
          break;
        case 'exit_live_mode':
          handleExit();
          break;
      }
    },
    [nextSection, prevSection, toggleFullscreen, handleExit],
  );

  const { config: _config, ...remoteSettingsProps } = useRemoteControl({
    onAction: handleRemoteAction,
    isActive: true,
  });

  const fullscreenMapping = remoteSettingsProps.getMappingForAction('toggle_fullscreen');
  const fullscreenShortcut = fullscreenMapping.keyboard[0]
    ? ` (${fullscreenMapping.keyboard[0].toUpperCase()})`
    : '';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!activeSection) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-surface-container-lowest text-primary gap-8 font-headline"
        data-testid="live-mode-view"
      >
        <p className="text-3xl font-black uppercase tracking-widest text-center">
          No sections found in this chart.
        </p>
        <button
          onClick={handleExit}
          data-testid="exit-live-mode-empty-btn"
          className="px-8 py-4 bg-primary text-on-primary rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl shadow-primary/20"
        >
          Exit Live Mode
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 ${Z_INDEX.BASE} bg-surface-container-lowest text-on-surface flex flex-col font-body`}
      data-testid="live-mode-view"
      id="live-mode-view-root"
    >
      {/* Header - Hidden in Fullscreen */}
      {!isFullscreen && (
        <header
          className="p-6 bg-surface-container-low border-b border-outline-variant/10 flex justify-between items-center transition-all duration-300"
          data-testid="live-mode-header"
        >
          <div>
            <h1
              className="text-3xl font-headline font-black uppercase tracking-tighter text-primary"
              data-testid="live-mode-title"
            >
              {chart.header.title}
            </h1>
            <div className="flex gap-4 mt-1 text-on-surface-variant font-headline text-xs font-bold uppercase tracking-widest">
              <span>BPM: {chart.header.bpm || 'N/A'}</span>
              <div className="w-[1px] h-3 bg-outline-variant/30 self-center"></div>
              <span>
                {chart.header.timeSignature.beatsPerMeasure}/{chart.header.timeSignature.beatValue}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <a
              href="/manual"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-headline font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors mr-2"
            >
              Manual
            </a>
            <RemoteControlSettings {...remoteSettingsProps} />
            <button
              onClick={toggleFullscreen}
              data-testid="live-mode-fullscreen-btn"
              className="px-4 py-2 bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all border border-outline-variant/10"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              {fullscreenShortcut}
            </button>
            <button
              onClick={handleExit}
              data-testid="exit-live-mode-btn"
              className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all border border-error/20"
            >
              Exit Live Mode
            </button>
          </div>
        </header>
      )}

      {/* Transition Overlay - Outside main to avoid opacity-30 during transition */}
      {isTransitioning && (
        <div
          className={`fixed inset-0 ${Z_INDEX.TRANSITION} flex items-center justify-center pointer-events-none`}
        >
          <div className="text-9xl font-headline font-black text-primary animate-ping-slow uppercase tracking-tighter">
            {activeSection.name}
          </div>
        </div>
      )}

      {/* Fullscreen Progress Minimalist - Outside main to avoid dimming */}
      {isFullscreen && (
        <div
          className={`fixed top-6 right-10 ${Z_INDEX.PROGRESS_FULLSCREEN} flex gap-2`}
          data-testid="live-mode-progress-indicator-fullscreen"
        >
          {chart.sections.map((section, idx) => (
            <div
              key={section.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeSectionIdx ? 'w-10 bg-primary shadow-glow-sm' : 'w-4 bg-on-surface/10'
              }`}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--color-primary-dim)_0%,transparent_40%)] transition-opacity duration-300 ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-end mb-12 border-b-4 border-primary pb-6">
            <div className="flex flex-col">
              <div className="text-primary font-headline font-bold text-xs uppercase tracking-[0.4em] mb-2">
                Current Section
              </div>
              <h2
                className="text-7xl lg:text-9xl font-headline font-black uppercase text-on-surface leading-none tracking-tighter"
                data-testid="active-section-name"
              >
                {activeSection.name}
              </h2>
              {activeSection.measuresCount > 0 && (
                <div
                  className="text-2xl font-headline font-bold text-on-surface-variant mt-4 tracking-[0.2em] uppercase opacity-70"
                  data-testid="section-measures-count"
                >
                  {activeSection.measuresCount} Measures
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="text-5xl font-headline text-on-surface-variant font-black mb-4 opacity-30">
                {activeSectionIdx + 1} <span className="text-2xl opacity-50">/</span>{' '}
                {chart.sections.length}
              </div>
              {activeSectionIdx < chart.sections.length - 1 && (
                <div className="text-right" data-testid="next-section-preview">
                  <div className="text-primary font-headline font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                    Up Next
                  </div>
                  <div className="text-3xl font-headline font-bold text-on-surface uppercase tracking-tight">
                    {chart.sections[activeSectionIdx + 1].name}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-20">
            {activeSection.grid && (
              <div className="bg-surface-container-low p-12 rounded-[48px] border border-outline-variant/10 shadow-3xl shadow-black/60 overflow-x-auto">
                <GrooveGridEditor
                  initialGrid={activeSection.grid}
                  readOnly
                  hideToolbar
                  cellSize={52}
                />
              </div>
            )}

            {activeSection.notes && activeSection.notes.length > 0 && (
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-outline-variant/20"></div>
                  <h3 className="text-2xl font-headline font-bold text-primary uppercase tracking-[0.4em]">
                    Performance Cues
                  </h3>
                  <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-outline-variant/20"></div>
                </div>
                <ul className="space-y-8">
                  {activeSection.notes.map((note, idx) => (
                    <li
                      key={idx}
                      className="text-5xl lg:text-7xl font-headline font-black text-on-surface flex gap-8 items-start leading-[1.1]"
                    >
                      <span className="text-primary mt-2">»</span>
                      <span className="bg-gradient-to-br from-on-surface via-on-surface to-on-surface-variant/70 bg-clip-text text-transparent">
                        {note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSection.subSections && activeSection.subSections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                {activeSection.subSections.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-surface-container-low/40 p-10 rounded-[40px] border border-outline-variant/10 backdrop-blur-md shadow-2xl"
                  >
                    <h4 className="text-3xl font-headline font-bold text-on-surface mb-8 uppercase flex justify-between items-center border-b border-outline-variant/10 pb-6">
                      <span>{sub.name}</span>
                      {sub.measuresCount > 0 && (
                        <span
                          className="text-xl text-primary font-black tracking-widest bg-primary/10 px-5 py-2 rounded-2xl border border-primary/20 shadow-glow-sm"
                          data-testid={`subsection-measures-${sub.id}`}
                        >
                          {sub.measuresCount}M
                        </span>
                      )}
                    </h4>
                    {sub.grid && (
                      <div className="overflow-x-auto">
                        <GrooveGridEditor
                          initialGrid={sub.grid}
                          readOnly
                          hideToolbar
                          cellSize={44}
                        />
                      </div>
                    )}
                    {sub.notes && sub.notes.length > 0 && (
                      <ul className="mt-8 space-y-4">
                        {sub.notes.map((n, i) => (
                          <li
                            key={i}
                            className="text-2xl font-headline font-bold text-on-surface-variant flex gap-4 leading-snug"
                          >
                            <span className="text-primary">•</span> {n}
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

      {/* Navigation Footer - Hidden in Fullscreen */}
      {!isFullscreen && (
        <footer className="p-8 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <button
            disabled={activeSectionIdx === 0}
            onClick={prevSection}
            data-testid="live-mode-prev-btn"
            className="flex items-center gap-6 text-on-surface-variant hover:text-primary disabled:opacity-10 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl border-2 border-outline-variant/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-headline font-black uppercase tracking-[0.3em] opacity-40 mb-1">
                PREVIOUS
              </div>
              <div className="text-xl font-headline font-black uppercase tracking-tight">
                {activeSectionIdx > 0 ? chart.sections[activeSectionIdx - 1].name : 'TOP'}
              </div>
            </div>
          </button>

          <div
            className="flex gap-3 px-6 py-3 bg-surface-container-highest/50 rounded-full border border-outline-variant/10"
            role="list"
            aria-label="Song sections progress"
          >
            {chart.sections.map((section, idx) => (
              <div
                key={section.id}
                role="listitem"
                aria-label={`Section ${idx + 1} of ${chart.sections.length}: ${section.name}${
                  idx === activeSectionIdx ? ', current section' : ''
                }`}
                aria-current={idx === activeSectionIdx ? 'step' : undefined}
                className={`h-3 rounded-full transition-all duration-500 ${
                  idx === activeSectionIdx
                    ? 'w-12 bg-primary shadow-[0_0_15px_var(--color-primary)]'
                    : 'w-3 bg-on-surface-variant/20'
                }`}
              />
            ))}
          </div>

          <button
            disabled={activeSectionIdx === chart.sections.length - 1}
            onClick={nextSection}
            data-testid="live-mode-next-btn"
            className="flex items-center gap-6 text-on-surface-variant hover:text-primary disabled:opacity-10 transition-all group text-right"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-headline font-black uppercase tracking-[0.3em] opacity-40 mb-1">
                NEXT
              </div>
              <div className="text-xl font-headline font-black uppercase tracking-tight text-primary">
                {activeSectionIdx < chart.sections.length - 1
                  ? chart.sections[activeSectionIdx + 1].name
                  : 'FINISH'}
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl border-2 border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all shadow-[0_0_20px_rgba(129,236,255,0.2)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </footer>
      )}
    </div>
  );
};
