const _SNIPPET_RETRY_DELAY_MS = 3000;

/**
 * Retries fetches on transient errors and replication lag; bails on 401/403.
 */
export async function fetchWithRetry<T>(
  fetchFn: () => PromiseLike<{ data: T | null; error: unknown }>,
  maxAttempts = 3,
  delayMs = _SNIPPET_RETRY_DELAY_MS,
): Promise<T | null> {
  let attempts = 0;
  let { data, error } = await fetchFn();

  const isBailableError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const errorObj = err as { code?: string | number; status?: string | number };
    const code = String(errorObj.code);
    const status = Number(errorObj.status);
    return ['22P02', '401', '403'].includes(code) || status === 401 || status === 403;
  };

  if (error && isBailableError(error)) {
    return null;
  }

  while (!data && attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const retryResult = await fetchFn();
    data = retryResult.data;
    error = retryResult.error;

    if (error && isBailableError(error)) {
      return null;
    }

    if (data) {
      return data;
    }
  }

  return data;
}
