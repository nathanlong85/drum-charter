import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAutosave } from '../useAutosave';

vi.mock('@/lib/utils/debounce', () => ({
  debounce: (fn: (data: unknown) => void) => {
    const debounced = (data: unknown) => fn(data);
    debounced.cancel = vi.fn();
    debounced.flush = vi.fn();
    return debounced;
  },
}));

describe('useAutosave', () => {
  it('calls saveFn when triggerSave runs', async () => {
    const saveFn = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAutosave(saveFn, 0));

    act(() => {
      result.current.triggerSave({ id: '1' });
    });

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith({ id: '1' });
    });
  });

  it('settleAutosave awaits pending writes', async () => {
    const saveFn = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useAutosave(saveFn, 0));

    act(() => {
      result.current.triggerSave({ id: 'a' });
    });

    await act(async () => {
      await result.current.settleAutosave();
    });

    expect(saveFn).toHaveBeenCalled();
  });
});
