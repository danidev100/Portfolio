import { useSyncExternalStore } from 'react';

const subscribe = (): (() => void) => () => undefined;

/** `false` on the server and during hydration, `true` once the phone is interactive. */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
