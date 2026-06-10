'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { DrumCategory, DrumInstrument } from '@/lib/types/groove';
import { PRESET_VARIETIES } from '@/lib/utils/instrumentPresets';

const DIALOG_CONTENT_CLASS =
  'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-surface-container-low' +
  ' rounded-3xl shadow-3xl w-full max-w-md border border-outline-variant/10' +
  ' animate-in zoom-in-95 duration-200 overflow-hidden';

interface InstrumentSettingsModalProps {
  instrument: DrumInstrument;
  onClose: () => void;
  onSave: (updates: Partial<DrumInstrument>) => void;
  onDelete: () => void;
}

const CATEGORIES: { value: DrumCategory; label: string }[] = [
  { value: 'kick', label: 'Kick' },
  { value: 'snare', label: 'Snare' },
  { value: 'hi-hat', label: 'Hi-Hat' },
  { value: 'tom', label: 'Tom' },
  { value: 'crash', label: 'Crash' },
  { value: 'ride', label: 'Ride' },
  { value: 'misc', label: 'Miscellaneous' },
];

export const InstrumentSettingsModal: React.FC<InstrumentSettingsModalProps> = ({
  instrument,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(instrument.customName);
  const [category, setCategory] = useState<DrumCategory>(instrument.category);
  const [variety, setVariety] = useState(instrument.presetVariety);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the first input after a short delay to allow for modal transition
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customName: name,
      category,
      presetVariety: variety,
    });
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          className={DIALOG_CONTENT_CLASS}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container">
            <Dialog.Title className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
              Instrument Settings
            </Dialog.Title>
            <Dialog.Close
              className="p-2 hover:bg-surface-container-highest text-on-surface-variant/60 hover:text-on-surface rounded-full transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="inst-name"
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1"
              >
                Custom Name
              </label>
              <input
                id="inst-name"
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all font-headline font-bold"
                placeholder="e.g. Main Snare"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="inst-category"
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1"
              >
                Category
              </label>
              <div className="relative group">
                <select
                  id="inst-category"
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as DrumCategory;
                    setCategory(newCat);
                    const varieties = PRESET_VARIETIES[newCat] || [];
                    if (!varieties.includes(variety)) {
                      setVariety(varieties[0] ?? '');
                    }
                  }}
                  className="w-full px-5 py-4 bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl text-on-surface outline-none transition-all font-headline font-bold appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-surface-container-high">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="inst-variety"
                className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1"
              >
                Type
              </label>
              <div className="relative group">
                <select
                  id="inst-variety"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-5 py-4 bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl text-on-surface outline-none transition-all font-headline font-bold appearance-none cursor-pointer"
                >
                  {(PRESET_VARIETIES[category] || []).map((v) => (
                    <option key={v} value={v} className="bg-surface-container-high">
                      {v}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/40 italic font-body ml-1 uppercase tracking-wider">
                This affects which samples are played back.
              </p>
            </div>

            <div className="pt-8 flex items-center justify-between border-t border-outline-variant/5 mt-4">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this instrument?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 text-[10px] font-headline font-black uppercase tracking-widest text-error hover:bg-error/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
                Remove
              </button>

              <div className="flex gap-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-6 py-3 text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-on-primary font-headline font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
