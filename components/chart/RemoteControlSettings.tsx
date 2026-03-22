'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Settings, X } from 'lucide-react';
import type React from 'react';
import type { RemoteAction } from '@/lib/hooks/useRemoteControl';

interface RemoteControlSettingsProps {
  isListeningForMap: RemoteAction | null;
  lastEventMsg: string;
  midiSupported: boolean;
  midiConnected: boolean;
  listenForMap: (action: RemoteAction) => void;
  cancelListen: () => void;
  resetConfig: () => void;
  getMappingForAction: (action: RemoteAction) => { keyboard: string[]; midi: string[] };
}

export const RemoteControlSettings: React.FC<RemoteControlSettingsProps> = ({
  isListeningForMap,
  lastEventMsg,
  midiSupported,
  midiConnected,
  listenForMap,
  cancelListen,
  resetConfig,
  getMappingForAction,
}) => {
  const actions: { id: RemoteAction; label: string }[] = [
    { id: 'next_section', label: 'Next Section' },
    { id: 'prev_section', label: 'Previous Section' },
    { id: 'toggle_fullscreen', label: 'Toggle Fullscreen' },
    { id: 'exit_live_mode', label: 'Exit Live Mode' },
  ];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          title="Remote Control Settings"
        >
          <Settings size={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10001]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-[90vw] max-w-md p-6 z-[10002] text-zinc-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-white uppercase tracking-wider">
                Remote Control
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-400 mt-1">
                Map Bluetooth pedals or MIDI controllers to Live Mode actions.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-zinc-500 hover:text-white transition-colors"
                onClick={cancelListen}
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">MIDI Support:</span>
              {midiSupported ? (
                <span className={midiConnected ? 'text-emerald-400' : 'text-yellow-400'}>
                  {midiConnected ? 'Connected' : 'Available (Not Connected)'}
                </span>
              ) : (
                <span className="text-red-400">Not Supported</span>
              )}
            </div>

            <div className="space-y-4">
              {actions.map((action) => {
                const mapping = getMappingForAction(action.id);
                const isListening = isListeningForMap === action.id;

                return (
                  <div
                    key={action.id}
                    className="flex flex-col gap-2 p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-zinc-200">{action.label}</span>
                      <button
                        onClick={() => (isListening ? cancelListen() : listenForMap(action.id))}
                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase transition-colors ${
                          isListening
                            ? 'bg-yellow-500 text-black animate-pulse'
                            : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                        }`}
                      >
                        {isListening ? 'Press Pedal...' : 'Map'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {mapping.keyboard.length === 0 &&
                        mapping.midi.length === 0 &&
                        !isListening && <span className="text-zinc-500 italic">Unmapped</span>}
                      {mapping.keyboard.map((k) => (
                        <span
                          key={`kb-${k}`}
                          className="px-2 py-1 bg-zinc-700 rounded text-zinc-300 font-mono"
                        >
                          {k === ' ' ? 'Space' : k}
                        </span>
                      ))}
                      {mapping.midi.map((m) => (
                        <span
                          key={`midi-${m}`}
                          className="px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded font-mono border border-emerald-800/50"
                        >
                          MIDI: {m}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {lastEventMsg && (
              <div className="text-xs text-center text-zinc-500 font-mono">
                Last Event: {lastEventMsg}
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 flex justify-center">
              <button
                onClick={resetConfig}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
