"use client";

import { useEffect, useRef } from "react";
import type { Ambient } from "./runtime/ambient";
import { useSound } from "./sound";

/**
 * Plays the ambient wind while the HUD's sound toggle is on (sound.ts). The engine (Web Audio) is imported on
 * the first press, so it adds nothing to the page load; it is only ever started by that press. Renders nothing.
 */
export function AmbientSound() {
  const on = useSound();
  const engine = useRef<Ambient | null | undefined>(undefined);

  useEffect(() => {
    if (!on && !engine.current) return;
    let live = true;
    void (async () => {
      if (engine.current === undefined) {
        const { createAmbient } = await import("./runtime/ambient");
        if (!live) return;
        engine.current = createAmbient();
      }
      engine.current?.set(on);
    })();
    return () => {
      live = false;
    };
  }, [on]);

  useEffect(() => () => engine.current?.close(), []);
  return null;
}
