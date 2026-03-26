'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type DrumSymbol, type GrooveGrid, getVelocityForSymbol } from '@/lib/types/groove';

interface UseAudioPlaybackProps {
  grid: GrooveGrid;
  bpm: number;
  onStepChange?: (step: number) => void;
  initialMetronomeEnabled?: boolean;
  initialMetronomeVolume?: boolean | number;
}

export function useAudioPlayback({
  grid,
  bpm,
  onStepChange,
  initialMetronomeEnabled = false,
  initialMetronomeVolume = 0.5,
}: UseAudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSamplesLoaded, setIsSamplesLoaded] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(initialMetronomeEnabled);
  const [metronomeVolume, setMetronomeVolume] = useState(
    typeof initialMetronomeVolume === 'number' ? initialMetronomeVolume : 0.5,
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const samplesRef = useRef<Map<DrumSymbol | string, AudioBuffer>>(new Map());
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);
  const metronomeEnabledRef = useRef(metronomeEnabled);
  const metronomeVolumeRef = useRef(metronomeVolume);

  // Keep refs in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    metronomeEnabledRef.current = metronomeEnabled;
  }, [metronomeEnabled]);

  useEffect(() => {
    metronomeVolumeRef.current = metronomeVolume;
  }, [metronomeVolume]);

  // Configuration
  const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)

  // Load samples
  useEffect(() => {
    const loadSamples = async () => {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const sampleMap: Record<string, string> = {
        kick: '/audio/samples/drum-kit/default/kick.wav',
        kick_standard: '/audio/samples/drum-kit/default/kick.wav',
        snare: '/audio/samples/drum-kit/default/snare.wav',
        snare_standard: '/audio/samples/drum-kit/default/snare.wav',
        snare_cross_stick: '/audio/samples/drum-kit/default/snare_cross_stick.wav',
        snare_flam: '/audio/samples/drum-kit/default/snare_flam.wav',
        snare_buzz: '/audio/samples/drum-kit/default/snare_buzz.wav',
        snare_rim_shot: '/audio/samples/drum-kit/default/snare_rimshot.wav',
        hi_hat_closed: '/audio/samples/drum-kit/default/hihat_closed.wav',
        hi_hat_open: '/audio/samples/drum-kit/default/hihat_open.wav',
        hi_hat_loose: '/audio/samples/drum-kit/default/hihat_loose.wav',
        hi_hat_pedal: '/audio/samples/drum-kit/default/hihat_pedal.wav',
        ride: '/audio/samples/drum-kit/default/ride.wav',
        ride_bell: '/audio/samples/drum-kit/default/ride_bell.wav',
        crash: '/audio/samples/drum-kit/default/crash.wav',
        crash_bell: '/audio/samples/drum-kit/default/crash_bell.wav',
        tom_high: '/audio/samples/drum-kit/default/tom_high.wav',
        tom_medium: '/audio/samples/drum-kit/default/tom_medium.wav',
        tom_floor: '/audio/samples/drum-kit/default/tom_floor.wav',
        click_high: '/audio/samples/metronome/click_high.wav',
        click_low: '/audio/samples/metronome/click_low.wav',
      };

      for (const [symbol, url] of Object.entries(sampleMap)) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          samplesRef.current.set(symbol as DrumSymbol, audioBuffer);
        } catch (error) {
          console.error(`Failed to load sample for ${symbol} from ${url}:`, error);
        }
      }
      setIsSamplesLoaded(true);
    };

    loadSamples();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSample = useCallback((sampleKey: string, time: number, velocity: number = 1.0) => {
    if (!audioContextRef.current || !samplesRef.current.has(sampleKey as DrumSymbol)) return;

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();

    source.buffer = samplesRef.current.get(sampleKey as DrumSymbol)!;

    // Clamping to 1.5 to prevent extreme clipping as per CodeRabbit recommendation
    const gainValue = Math.min(velocity ** 2.0, 1.5);
    gainNode.gain.setValueAtTime(gainValue, time);

    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    source.start(time);
  }, []);

  const scheduleNote = useCallback(
    (step: number, time: number) => {
      const currentGrid = gridRef.current;
      // 1. Schedule Metronome if enabled
      if (metronomeEnabledRef.current) {
        const stepsPerBeat = currentGrid.resolution / currentGrid.timeSignature.beatValue;
        const isBeat = step % stepsPerBeat === 0;

        if (isBeat) {
          const beatInMeasure =
            Math.floor(step / stepsPerBeat) % currentGrid.timeSignature.beatsPerMeasure;
          const isFirstBeat = beatInMeasure === 0;
          const sampleKey = isFirstBeat ? 'click_high' : 'click_low';
          playSample(sampleKey, time, metronomeVolumeRef.current);
        }
      }

      // 2. Check each instrument at this step
      currentGrid.instruments.forEach((inst) => {
        const symbol = inst.notes[step];
        if (symbol && symbol !== 'none') {
          // Check optional hit toggle
          const isOptional = symbol.endsWith('_opt');
          if (isOptional && currentGrid.playbackOptionalHits === false) {
            return;
          }

          const category = inst.category.toLowerCase();
          const variety = inst.presetVariety.toLowerCase().replace(/\s+/g, '_');

          // Determine velocity
          let velocity = getVelocityForSymbol(symbol);
          if (inst.velocities && inst.velocities[step] !== undefined) {
            velocity = inst.velocities[step];
          }

          const candidates = [
            symbol,
            `${variety}_${symbol}`,
            `${category}_${symbol}`,
            variety,
            category,
          ];

          for (const cand of candidates) {
            if (samplesRef.current.has(cand as DrumSymbol)) {
              playSample(cand, time, velocity);
              return;
            }
          }

          if (category === 'kick' || category === 'bass') {
            playSample('kick', time, velocity);
          } else if (category === 'snare') {
            playSample('snare', time, velocity);
          } else if (category === 'hi-hat') {
            playSample('hi_hat_closed', time, velocity);
          } else if (category === 'tom') {
            if (variety.includes('high')) playSample('tom_high', time, velocity);
            else if (variety.includes('floor')) playSample('tom_floor', time, velocity);
            else playSample('tom_medium', time, velocity);
          }
        }
      });

      if (onStepChange) {
        onStepChange(step);
      }
    },
    [onStepChange, playSample],
  );

  const nextNote = useCallback(() => {
    const currentGrid = gridRef.current;
    const secondsPerBeat = 60.0 / bpmRef.current;
    const { resolution, timeSignature, measures } = currentGrid;
    const secondsPerStep = secondsPerBeat / (resolution / timeSignature.beatValue);

    nextNoteTimeRef.current += secondsPerStep;
    currentStepRef.current =
      (currentStepRef.current + 1) %
      (timeSignature.beatsPerMeasure * (resolution / timeSignature.beatValue) * measures);
  }, []);

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      scheduleNote(currentStepRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(() => scheduler(), lookahead);
  }, [scheduleNote, nextNote]);

  const togglePlayback = () => {
    if (isPlaying) {
      if (timerIDRef.current) {
        window.clearTimeout(timerIDRef.current);
      }
      setIsPlaying(false);
    } else {
      if (!audioContextRef.current || !isSamplesLoaded) return;

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      currentStepRef.current = 0;
      nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  };

  return {
    isPlaying,
    isSamplesLoaded,
    togglePlayback,
    metronomeEnabled,
    setMetronomeEnabled,
    metronomeVolume,
    setMetronomeVolume,
  };
}
