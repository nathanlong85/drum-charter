'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  const debouncedSave = useRef(
    debounce(async (data: T) => {
      if (!isMountedRef.current) return;
      setIsSaving(true);
      setError(null);
      const savePromise = saveFn(data);
      pendingSaveRef.current = savePromise;
      try {
        await savePromise;
      } catch (err) {
        console.error('Autosave failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to save changes');
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
        if (pendingSaveRef.current === savePromise) {
          pendingSaveRef.current = null;
        }
      }
    }, delay)
  ).current;

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
