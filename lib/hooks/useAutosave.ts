'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * A generic hook for managing debounced autosave state.
 * @param saveFn The async function that performs the save operation.
 * @param delay The debounce delay in milliseconds.
 */
export function useAutosave<T>(saveFn: (data: T) => Promise<any>, delay = 2000) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const pendingSaveRef = useRef<Promise<any> | null>(null);
  const skipFlushOnUnmountRef = useRef(false);

  // Keep a stable ref to the latest saveFn to avoid recreating debounce too often if it changes
  const saveFnRef = useRef(saveFn);
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  const debouncedSave = useMemo(() => {
    const saver = debounce(async (data: T) => {
      if (!isMountedRef.current) return;
      setIsSaving(true);
      setError(null);

      const currentSavePromise = saveFnRef.current(data);
      pendingSaveRef.current = currentSavePromise;

      try {
        await currentSavePromise;
      } catch (err) {
        console.error('Autosave failed:', err);
        // Only update error if this is still the latest save attempt
        if (isMountedRef.current && pendingSaveRef.current === currentSavePromise) {
          setError(err instanceof Error ? err.message : 'Failed to save changes');
        }
      } finally {
        // Only clear saving state if this is still the latest save attempt
        if (isMountedRef.current && pendingSaveRef.current === currentSavePromise) {
          setIsSaving(false);
          pendingSaveRef.current = null;
        }
      }
    }, delay);

    return saver;
  }, [delay]);

  const settleAutosave = useCallback(async () => {
    debouncedSave.flush();
    if (pendingSaveRef.current) {
      await pendingSaveRef.current;
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
