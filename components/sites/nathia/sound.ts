"use client";

import { useSyncExternalStore } from "react";

// Ambient sound on/off, shared by the HUD toggle (in the page) and the sound engine (in the /nathia layout, so
// it keeps playing across routes, as live). Off on every visit: sound never starts without the visitor.
let on = false;
const listeners = new Set<() => void>();

export function setSound(next: boolean) {
  if (next === on) return;
  on = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Whether the ambient sound is on (false on the server). */
export function useSound() {
  return useSyncExternalStore(
    subscribe,
    () => on,
    () => false,
  );
}
