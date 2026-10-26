// The live Lenis instance, published by the lazily loaded smooth-scroll runtime. A tiny store instead
// of lenis/react's useLenis(), which would pull Lenis itself into the initial bundle.
import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

let current: Lenis | null = null;
const listeners = new Set<() => void>();

/** The current instance, outside React (event handlers, effects). Null before it loads or with reduced motion. */
export const getLenis = () => current;

export function setLenis(lenis: Lenis | null) {
  current = lenis;
  listeners.forEach((notify) => notify());
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

/** The smooth-scroll instance, or null before it loads, with reduced motion, and on the server. */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
