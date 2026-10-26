"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The Ascent timeline (GSAP, SplitText) loads after first paint, under the preloader.
const Motion = lazyMotion(() => import("../runtime/Ascent"));

/** Mounts the Ascent runtime for the scene with `sceneId`. `words`: each word's arrival point (0–1). */
export function AscentMotion({ sceneId, words }: { sceneId: string; words: number[] }) {
  return <Motion sceneId={sceneId} words={words} />;
}
