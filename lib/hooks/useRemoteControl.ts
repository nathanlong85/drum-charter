'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RemoteAction = 'next_section' | 'prev_section' | 'toggle_fullscreen' | 'exit_live_mode';

export interface RemoteControlConfig {
  keyboard: Record<string, RemoteAction>;
  midi: Record<string, RemoteAction>; // Format: "status:data1" (e.g. "144:36" for Note On, Note 36)
}

const DEFAULT_CONFIG: RemoteControlConfig = {
  keyboard: {
    arrowright: 'next_section',
    pagedown: 'next_section',
    ' ': 'next_section',
    arrowleft: 'prev_section',
    pageup: 'prev_section',
    f: 'toggle_fullscreen',
    escape: 'exit_live_mode',
  },
  midi: {}, // No default MIDI mappings
};

interface UseRemoteControlProps {
  onAction: (action: RemoteAction) => void;
  isActive: boolean;
}

export function useRemoteControl({ onAction, isActive }: UseRemoteControlProps) {
  const [config, setConfig] = useState<RemoteControlConfig>(DEFAULT_CONFIG);
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [isListeningForMap, setIsListeningForMap] = useState<RemoteAction | null>(null);
  const [lastEventMsg, setLastEventMsg] = useState<string>('');

  const configRef = useRef(config);
  const isListeningForMapRef = useRef(isListeningForMap);
  const onActionRef = useRef(onAction);
  const isActiveRef = useRef(isActive);

  // Keep refs in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    isListeningForMapRef.current = isListeningForMap;
  }, [isListeningForMap]);

  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Load config from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('drumcharter_remote_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({
          keyboard: { ...DEFAULT_CONFIG.keyboard, ...(parsed.keyboard || {}) },
          midi: { ...DEFAULT_CONFIG.midi, ...(parsed.midi || {}) },
        });
      }
    } catch (err) {
      console.error('Failed to load remote config:', err);
    }
  }, []);

  const saveConfig = useCallback((newConfig: RemoteControlConfig) => {
    setConfig(newConfig);
    localStorage.setItem('drumcharter_remote_config', JSON.stringify(newConfig));
  }, []);

  const resetConfig = () => {
    saveConfig(DEFAULT_CONFIG);
  };

  // Keyboard listener
  useEffect(() => {
    if (!isActive && !isListeningForMap) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;
      const key = e.key.toLowerCase();

      // If we are currently mapping an action
      if (isListeningForMap) {
        e.preventDefault();
        e.stopPropagation();

        // Remove this key from any other action
        const newKeyboardConfig = { ...config.keyboard };
        for (const k in newKeyboardConfig) {
          if (newKeyboardConfig[k] === isListeningForMap) {
            delete newKeyboardConfig[k];
          }
        }
        newKeyboardConfig[key] = isListeningForMap;

        saveConfig({ ...config, keyboard: newKeyboardConfig });
        setLastEventMsg(`Keyboard: ${e.key}`);
        setIsListeningForMap(null);
        return;
      }

      // Normal mode
      // Don't trigger navigation if an interactive element has focus
      const activeEl = document.activeElement as HTMLElement | null;
      const isInteractive =
        activeEl &&
        (activeEl.tagName === 'BUTTON' ||
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.tagName === 'A' ||
          activeEl.isContentEditable ||
          activeEl.getAttribute('role') === 'textbox');

      const action = config.keyboard[key];
      if (action) {
        // Space usually triggers buttons, don't hijack if focused on a button
        if (key === ' ' && isInteractive) return;

        // Don't hijack normal inputs for other keys either, except Escape
        if (isInteractive && key !== 'escape') return;

        e.preventDefault();
        onAction(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, config, isListeningForMap, onAction, saveConfig]);

  // MIDI Setup - Only runs when midiAccess changes
  useEffect(() => {
    if (!midiAccess) {
      if ((navigator as any).requestMIDIAccess) {
        (navigator as any).requestMIDIAccess().then(
          (access: any) => {
            setMidiAccess(access);
          },
          (err: any) => {
            console.warn('MIDI Access failed', err);
          },
        );
      }
      return;
    }

    const onMIDIMessage = (message: any) => {
      if (!message.data || message.data.length < 2) return;

      const status = message.data[0];
      const data1 = message.data[1];
      const data2 = message.data.length > 2 ? message.data[2] : 0;

      // Ignore standard MIDI clock/active sensing
      if (status >= 248) return;

      // For switches, we care about Note On or Control Change
      if (data2 === 0 && status >= 144 && status <= 159) {
        return;
      }

      const eventKey = `${status}:${data1}`;
      const currentIsListening = isListeningForMapRef.current;

      if (currentIsListening) {
        const currentConfig = configRef.current;
        const newMidiConfig = { ...currentConfig.midi };
        for (const k in newMidiConfig) {
          if (newMidiConfig[k] === currentIsListening) {
            delete newMidiConfig[k];
          }
        }
        newMidiConfig[eventKey] = currentIsListening;

        saveConfig({ ...currentConfig, midi: newMidiConfig });
        setLastEventMsg(`MIDI: ${eventKey}`);
        setIsListeningForMap(null);
        return;
      }

      if (isActiveRef.current) {
        const action = configRef.current.midi[eventKey];
        if (action) {
          onActionRef.current(action);
        }
      }
    };

    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }

    midiAccess.onstatechange = (e: any) => {
      if (e.port.type === 'input') {
        const port = e.port;
        port.onmidimessage = onMIDIMessage;
      }
    };

    return () => {
      const inputs = midiAccess.inputs.values();
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = null;
      }
    };
  }, [midiAccess, saveConfig]);

  const listenForMap = (action: RemoteAction) => {
    setIsListeningForMap(action);
    setLastEventMsg('');
  };

  const cancelListen = () => {
    setIsListeningForMap(null);
  };

  const getMappingForAction = (action: RemoteAction) => {
    const keys = Object.keys(config.keyboard).filter((k) => config.keyboard[k] === action);
    const midis = Object.keys(config.midi).filter((m) => config.midi[m] === action);

    return {
      keyboard: keys,
      midi: midis,
    };
  };

  return {
    config,
    isListeningForMap,
    lastEventMsg,
    midiSupported: typeof (navigator as any).requestMIDIAccess !== 'undefined',
    midiConnected: !!midiAccess?.inputs && Array.from(midiAccess.inputs.values()).length > 0,
    listenForMap,
    cancelListen,
    resetConfig,
    getMappingForAction,
  };
}
