export interface DebouncedFunction<T extends (...args: never[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Debounces calls; supports cancel and flush (lodash-compatible subset).
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number,
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      lastArgs = undefined;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timeoutId === undefined || lastArgs === undefined) return;
    clearTimeout(timeoutId);
    timeoutId = undefined;
    const args = lastArgs;
    lastArgs = undefined;
    fn(...args);
  };

  return debounced;
}
