import { useEffect, useRef } from 'react';

/**
 * Runs `callback` immediately and then every `intervalMs` milliseconds.
 * Cleans up on unmount. Pauses when `enabled` is false.
 */
export const usePolling = (
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Fire immediately
    savedCallback.current();

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
};
