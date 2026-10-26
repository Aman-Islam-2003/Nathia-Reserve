"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The portal timeline (GSAP) loads after first paint.
const Motion = lazyMotion(() => import("../runtime/ExplorerPortal"), { near: true });

/** Mounts the explorer portal runtime for the scene with `sceneId`. */
export function ExplorerMotion({ sceneId }: { sceneId: string }) {
  return <Motion sceneId={sceneId} />;
}
