"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The Measure timeline (GSAP) loads after first paint.
const Motion = lazyMotion(() => import("../runtime/Measure"), { near: true });

export type MeasurePhoto = { img: string; focus?: [number, number]; zoom?: number };

/** Mounts the Measure runtime for the scene with `sceneId`; `numbers`: each number's photo and framing. */
export function MeasureMotion({ sceneId, numbers }: { sceneId: string; numbers: MeasurePhoto[] }) {
  return <Motion sceneId={sceneId} numbers={numbers} />;
}
