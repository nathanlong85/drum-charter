'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GrooveGrid, DrumSymbol } from '@/lib/types/groove';

interface UseAudioPlaybackProps {
  grid: GrooveGrid;
  bpm: number;
  onStepChange?: (step: number) => void;
}

export function useAudioPlayback({ grid, bpm, onStepChange }: UseAudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const samplesRef = useRef<Map<DrumSymbol, AudioBuffer>>(new Map());
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);

  // Configuration
  const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)

  // Load samples
  useEffect(() => {
    const loadSamples = async () => {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const sampleMap: Record<string, string> = {
        'kick': '/audio/samples/drum-kit/default/kick.wav',
        'snare': '/audio/samples/drum-kit/default/snare.wav',
        'snare_cross_stick': '/audio/samples/drum-kit/default/snare_cross_stick.wav',
        'snare_flam': '/audio/samples/drum-kit/default/snare_flam.wav',
        'snare_buzz': '/audio/samples/drum-kit/default/snare_buzz.wav',
        'snare_rim_shot': '/audio/samples/drum-kit/default/snare_rimshot.wav',
        'hi_hat_closed': '/audio/samples/drum-kit/default/hihat_closed.wav',
        'hi_hat_open': '/audio/samples/drum-kit/default/hihat_open.wav',
        'hi_hat_loose': '/audio/samples/drum-kit/default/hihat_loose.wav',
        'hi_hat_pedal': '/audio/samples/drum-kit/default/hihat_pedal.wav',
        'ride': '/audio/samples/drum-kit/default/ride.wav',
        'ride_bell': '/audio/samples/drum-kit/default/ride_bell.wav',
        'crash': '/audio/samples/drum-kit/default/crash.wav',
        'crash_bell': '/audio/samples/drum-kit/default/crash_bell.wav',
        'tom_high': '/audio/samples/drum-kit/default/tom_high.wav',
        'tom_medium': '/audio/samples/drum-kit/default/tom_medium.wav',
        'tom_floor': '/audio/samples/drum-kit/default/tom_floor.wav',
        'standard': '/audio/samples/drum-kit/default/snare.wav', // Fallback
      };

      for (const [symbol, url] of Object.entries(sampleMap)) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          samplesRef.current.set(symbol as DrumSymbol, audioBuffer);
        } catch (error) {
          console.error(`Failed to load sample for ${symbol}:`, error);
        }
      }
    };

    loadSamples();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSample = (sampleKey: string, time: number, velocity: number = 1.0) => {
    if (!audioContextRef.current || !samplesRef.current.has(sampleKey as DrumSymbol)) return;

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    
    source.buffer = samplesRef.current.get(sampleKey as DrumSymbol)!;
    
    // Set volume based on velocity (0-1 range)
    // Using an exponential curve for more natural volume transitions
    const gainValue = Math.pow(velocity, 1.5);
    gainNode.gain.setValueAtTime(gainValue, time);
    
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    source.start(time);
  };

  const getVelocityForSymbol = (symbol: DrumSymbol): number => {
    if (symbol === 'accent') return 1.0;
    if (symbol === 'ghost') return 0.3;
    if (symbol === 'standard') return 0.7;
    if (symbol === 'none') return 0;
    
    // Handle _opt variants and other symbols
    if (symbol.includes('accent')) return 1.0;
    if (symbol.includes('ghost')) return 0.3;
    return 0.7; // Default for everything else
  };

  const scheduleNote = (step: number, time: number) => {
    // Check each instrument at this step
    grid.instruments.forEach((inst) => {
      const symbol = inst.notes[step];
      if (symbol && symbol !== 'none') {
        const instId = inst.instrumentId.toLowerCase();
        
        // Determine velocity: explicit value from inst.velocities, or derived from symbol
        let velocity = getVelocityForSymbol(symbol);
        if (inst.velocities && inst.velocities[step] !== undefined) {
          velocity = inst.velocities[step];
        }

        // 1. Try symbol-specific sound first (e.g., if "rim_shot" is a global sample)
        if (samplesRef.current.has(symbol)) {
          playSample(symbol, time, velocity);
          return;
        }

        // 2. Try instrument + symbol combination (e.g., snare_rim_shot)
        const combinedKey = `${instId}_${symbol}`;
        if (samplesRef.current.has(combinedKey as DrumSymbol)) {
          playSample(combinedKey, time, velocity);
          return;
        }

        // 3. Fallback to instrument default
        if (instId.includes('kick') || instId.includes('bass')) {
          playSample('kick', time, velocity);
        } else if (instId.includes('snare')) {
          playSample('snare', time, velocity);
        } else if (instId.includes('hi_hat') || instId.includes('hat')) {
          playSample('hi_hat_closed', time, velocity);
        } else if (instId.includes('ride')) {
          playSample('ride', time, velocity);
        } else if (instId.includes('crash')) {
          playSample('crash', time, velocity);
        } else if (instId.includes('tom')) {
          if (instId.includes('high')) playSample('tom_high', time, velocity);
          else if (instId.includes('mid')) playSample('tom_medium', time, velocity);
          else if (instId.includes('floor')) playSample('tom_floor', time, velocity);
          else playSample('tom_medium', time, velocity);
        }
      }
    });

    if (onStepChange) {
      // Sync UI with audio (rough estimation for now)
      onStepChange(step);
    }
  };

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpm;
    // We assume resolution is 16th notes (4 notes per beat) for now
    // TODO: Use grid.resolution to calculate this accurately
    const secondsPerStep = secondsPerBeat / (grid.resolution / grid.timeSignature.beatValue);
    
    nextNoteTimeRef.current += secondsPerStep;
    currentStepRef.current = (currentStepRef.current + 1) % (grid.timeSignature.beatsPerMeasure * (grid.resolution / grid.timeSignature.beatValue) * grid.measures);
  };

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      scheduleNote(currentStepRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [grid, bpm]);

  const togglePlayback = () => {
    if (isPlaying) {
      if (timerIDRef.current) {
        window.clearTimeout(timerIDRef.current);
      }
      setIsPlaying(false);
    } else {
      if (!audioContextRef.current) return;
      
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      currentStepRef.current = 0;
      nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  };

  return { isPlaying, togglePlayback };
}
