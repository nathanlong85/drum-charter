'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * A generic hook for managing debounced autosave state with serialized writes.
 * @param saveFn The async function that performs the save operation.
 * @param delay The debounce delay in milliseconds.
 */
export function useAutosave<T, R = unknown>(saveFn: (data: T) => Promise<R>, delay = 2000) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const skipFlushOnUnmountRef = useRef(false);

  // Keep a stable ref to the latest saveFn to avoid recreating debounce too often
  const saveFnRef = useRef(saveFn);
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  // Serialization queue to prevent out-of-order writes
  const writeQueueRef = useRef<Promise<R>>(Promise.resolve({} as R));
  const latestSavePromiseRef = useRef<Promise<R> | null>(null);

  const debouncedSave = useMemo(() => {
    const saver = debounce(async (data: T) => {
      if (!isMountedRef.current) return;

      setIsSaving(true);
      setError(null);

      // Enqueue the save operation
      const currentSavePromise = writeQueueRef.current.then(async () => {
        return saveFnRef.current(data);
      });

      writeQueueRef.current = currentSavePromise;
      latestSavePromiseRef.current = currentSavePromise;

      try {
        await currentSavePromise;
      } catch (err) {
        console.error('Autosave failed:', err);
        // Only update error if this is still the latest save attempt
        if (isMountedRef.current && latestSavePromiseRef.current === currentSavePromise) {
          setError(err instanceof Error ? err.message : 'Failed to save changes');
        }
      } finally {
        // Only clear saving state if this is still the latest save attempt
        if (isMountedRef.current && latestSavePromiseRef.current === currentSavePromise) {
          setIsSaving(false);
          latestSavePromiseRef.current = null;
        }
      }
    }, delay);

    return saver;
  }, [delay]);

  const settleAutosave = useCallback(async () => {
    debouncedSave.flush();
    // Await the entire queue to ensure all pending saves finish
    try {
      await writeQueueRef.current;
    } catch (err) {
      console.error('Error settling autosave queue:', err);
    }
  }, [debouncedSave]);

  const cancelAutosave = useCallback(() => {
    debouncedSave.cancel();
    skipFlushOnUnmountRef.current = true;
  }, [debouncedSave]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      if (!skipFlushOnUnmountRef.current) {
        debouncedSave.flush();
      }
      isMountedRef.current = false;
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    isSaving,
    error,
    triggerSave: debouncedSave,
    settleAutosave,
    cancelAutosave,
  };
}
