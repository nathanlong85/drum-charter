'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { DrumCategory, DrumInstrument } from '@/lib/types/groove';

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
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Instrument Settings
            </Dialog.Title>
            <Dialog.Close className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-1">
              <label htmlFor="inst-name" className="text-xs font-bold text-gray-500 uppercase">
                Custom Name
              </label>
              <input
                id="inst-name"
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Main Snare"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="inst-category" className="text-xs font-bold text-gray-500 uppercase">
                Category
              </label>
              <select
                id="inst-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DrumCategory)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="inst-variety" className="text-xs font-bold text-gray-500 uppercase">
                Variety (Sample Preset)
              </label>
              <input
                id="inst-variety"
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Snare"
              />
              <p className="text-[10px] text-gray-400 italic">
                This affects which samples are played back.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this instrument?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                <Trash2 size={16} />
                Delete Row
              </button>

              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm transition-colors"
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
