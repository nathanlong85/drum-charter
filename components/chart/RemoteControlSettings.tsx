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
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) cancelListen();
      }}
    >
      <Dialog.Trigger asChild>
        <button
          className="p-2 text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
          title="Remote Control Settings"
        >
          <Settings size={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10001] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-low border border-outline-variant/10 rounded-[32px] shadow-3xl w-[90vw] max-w-md p-8 z-[10002] animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-8">
            <div>
              <Dialog.Title className="text-2xl font-headline font-black text-on-surface uppercase tracking-tight">
                Remote Link
              </Dialog.Title>
              <Dialog.Description className="text-[10px] font-headline font-bold text-on-surface-variant/40 mt-1 uppercase tracking-widest leading-relaxed">
                Map Bluetooth pedals or MIDI controllers <br /> to Live Mode actions.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 hover:bg-surface-container-highest text-on-surface-variant/40 hover:text-on-surface rounded-full transition-all"
                onClick={cancelListen}
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest/50 rounded-2xl border border-outline-variant/10">
              <span className="text-[10px] font-headline font-black text-on-surface-variant/60 uppercase tracking-widest">
                MIDI ENGINE STATUS
              </span>
              {midiSupported ? (
                <span
                  className={`text-[9px] font-headline font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm ${
                    midiConnected ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                  }`}
                >
                  {midiConnected ? 'Connected' : 'Available'}
                </span>
              ) : (
                <span className="text-[9px] font-headline font-black uppercase tracking-widest px-3 py-1 bg-error/10 text-error rounded-md">
                  Not Supported
                </span>
              )}
            </div>

            <div className="space-y-4">
              {actions.map((action) => {
                const mapping = getMappingForAction(action.id);
                const isListening = isListeningForMap === action.id;

                return (
                  <div
                    key={action.id}
                    className="flex flex-col gap-4 p-4 bg-surface-container-low border border-outline-variant/5 rounded-2xl shadow-inner group hover:border-primary/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-headline font-black text-xs text-on-surface uppercase tracking-tight">
                        {action.label}
                      </span>
                      <button
                        onClick={() => (isListening ? cancelListen() : listenForMap(action.id))}
                        className={`px-5 py-2 text-[9px] font-headline font-black rounded-full uppercase tracking-widest transition-all ${
                          isListening
                            ? 'bg-primary text-on-primary animate-pulse shadow-lg shadow-primary/30'
                            : 'bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant/60 hover:text-primary border border-outline-variant/10'
                        }`}
                      >
                        {isListening ? 'Awaiting Input...' : 'Map Control'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[28px]">
                      {mapping.keyboard.length === 0 &&
                        mapping.midi.length === 0 &&
                        !isListening && (
                          <span className="text-[9px] font-label font-bold text-on-surface-variant/20 uppercase tracking-widest italic flex items-center">
                            Unassigned
                          </span>
                        )}
                      {mapping.keyboard.map((k) => (
                        <span
                          key={`kb-${k}`}
                          className="px-3 py-1 bg-surface-container-highest text-on-surface-variant font-headline font-black text-[9px] rounded-lg border border-outline-variant/10 shadow-sm"
                        >
                          {k === ' ' ? 'SPACE' : k.toUpperCase()}
                        </span>
                      ))}
                      {mapping.midi.map((m) => (
                        <span
                          key={`midi-${m}`}
                          className="px-3 py-1 bg-primary/10 text-primary font-headline font-black text-[9px] rounded-lg border border-primary/20 shadow-sm"
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
              <div className="text-[9px] text-center text-on-surface-variant/30 font-headline font-bold uppercase tracking-widest bg-surface-container-highest/30 py-2 rounded-lg border border-outline-variant/5">
                Last Event Received: {lastEventMsg}
              </div>
            )}

            <div className="pt-6 border-t border-outline-variant/5 flex justify-center">
              <button
                onClick={resetConfig}
                className="text-[10px] font-headline font-black text-error/60 hover:text-error uppercase tracking-[0.2em] transition-all hover:underline underline-offset-4"
              >
                Reset System Defaults
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
