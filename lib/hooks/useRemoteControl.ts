'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RemoteAction = 'next_section' | 'prev_section' | 'toggle_fullscreen' | 'exit_live_mode';

export interface RemoteControlConfig {
  keyboard: Record<string, RemoteAction[]>;
  midi: Record<string, RemoteAction[]>; // Format: "status:data1" (e.g. "144:36" for Note On, Note 36)
}

const DEFAULT_CONFIG: RemoteControlConfig = {
  keyboard: {
    arrowright: ['next_section'],
    pagedown: ['next_section'],
    ' ': ['next_section'],
    arrowleft: ['prev_section'],
    pageup: ['prev_section'],
    f: ['toggle_fullscreen'],
    escape: ['exit_live_mode'],
  },
  midi: {}, // No default MIDI mappings
};

interface UseRemoteControlProps {
  onAction: (action: RemoteAction) => void;
  isActive: boolean;
}

export function useRemoteControl({ onAction, isActive }: UseRemoteControlProps) {
  const [config, setConfig] = useState<RemoteControlConfig>(DEFAULT_CONFIG);
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [midiConnected, setMidiConnected] = useState(false);
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

  // SSR Safe navigator check
  const getNavigator = () => (typeof navigator !== 'undefined' ? navigator : null);

  // Load config from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('drumcharter_remote_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge: merge top-level objects, ensure each key maps to an array
        const mergedKeyboard = { ...DEFAULT_CONFIG.keyboard };
        if (parsed.keyboard) {
          for (const key in parsed.keyboard) {
            const val = parsed.keyboard[key];
            mergedKeyboard[key] = Array.isArray(val) ? val : [val];
          }
        }

        const mergedMidi = { ...DEFAULT_CONFIG.midi };
        if (parsed.midi) {
          for (const key in parsed.midi) {
            const val = parsed.midi[key];
            mergedMidi[key] = Array.isArray(val) ? val : [val];
          }
        }

        setConfig({
          keyboard: mergedKeyboard,
          midi: mergedMidi,
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
      const currentIsListening = isListeningForMapRef.current;

      // If we are currently mapping an action
      if (currentIsListening) {
        e.preventDefault();
        e.stopPropagation();

        const currentConfig = configRef.current;
        const newKeyboardConfig = { ...currentConfig.keyboard };
        
        // Append to existing actions for this key, ensuring no duplicates
        const existingActions = newKeyboardConfig[key] || [];
        if (!existingActions.includes(currentIsListening)) {
          newKeyboardConfig[key] = [...existingActions, currentIsListening];
        }

        saveConfig({ ...currentConfig, keyboard: newKeyboardConfig });
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

      const actions = config.keyboard[key];
      if (actions && actions.length > 0) {
        // Space usually triggers buttons, don't hijack if focused on a button
        if (key === ' ' && isInteractive) return;

        // Don't hijack normal inputs for other keys either, except Escape
        if (isInteractive && key !== 'escape') return;

        e.preventDefault();
        actions.forEach(action => onAction(action));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, config, isListeningForMap, onAction, saveConfig]);

  // MIDI Setup - Only runs when midiAccess changes
  useEffect(() => {
    const nav = getNavigator();
    if (!nav) return;

    if (!midiAccess) {
      if (nav.requestMIDIAccess) {
        nav.requestMIDIAccess().then(
          (access) => {
            setMidiAccess(access);
            setMidiConnected(access.inputs.size > 0);
          },
          (err) => {
            console.warn('MIDI Access failed', err);
          },
        );
      }
      return;
    }

    const onMIDIMessage = (message: MIDIMessageEvent) => {
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
        
        const existingActions = newMidiConfig[eventKey] || [];
        if (!existingActions.includes(currentIsListening)) {
          newMidiConfig[eventKey] = [...existingActions, currentIsListening];
        }

        saveConfig({ ...currentConfig, midi: newMidiConfig });
        setLastEventMsg(`MIDI: ${eventKey}`);
        setIsListeningForMap(null);
        return;
      }

      if (isActiveRef.current) {
        const actions = configRef.current.midi[eventKey];
        if (actions) {
          actions.forEach(action => onActionRef.current(action));
        }
      }
    };

    const refreshMidiState = () => {
      setMidiConnected(midiAccess.inputs.size > 0);
      
      const inputs = midiAccess.inputs.values();
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
      }
    };

    midiAccess.onstatechange = (e: MIDIConnectionEvent) => {
      const port = e.port;
      if (port && port.type === 'input') {
        const midiInput = port as MIDIInput;
        if (port.state === 'connected') {
          midiInput.onmidimessage = onMIDIMessage;
        } else {
          midiInput.onmidimessage = null;
        }
      }
      setMidiConnected(midiAccess.inputs.size > 0);
    };

    // Initial setup
    refreshMidiState();

    return () => {
      midiAccess.onstatechange = null;
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
    const keys = Object.keys(config.keyboard).filter((k) => 
      config.keyboard[k].includes(action)
    );
    const midis = Object.keys(config.midi).filter((m) => 
      config.midi[m].includes(action)
    );

    return {
      keyboard: keys,
      midi: midis,
    };
  };

  return {
    config,
    isListeningForMap,
    lastEventMsg,
    midiSupported: !!getNavigator()?.requestMIDIAccess,
    midiConnected,
    listenForMap,
    cancelListen,
    resetConfig,
    getMappingForAction,
  };
}
