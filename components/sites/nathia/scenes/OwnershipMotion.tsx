"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The structure line and the check marks (GSAP) load after first paint.
const Motion = lazyMotion(() => import("../runtime/Ownership"), { near: true });

/** Mounts the Ownership runtime for the scene with `sceneId`. */
export function OwnershipMotion({ sceneId }: { sceneId: string }) {
  return <Motion sceneId={sceneId} />;
}
