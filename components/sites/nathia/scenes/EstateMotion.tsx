"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The Estate film runtime (pin timeline, chapter switching, videos) is fetched and mounted when the scene is
// about 1.5 viewports away [live: whenNear 150%]; nothing of it loads with the page.
const Motion = lazyMotion(() => import("../runtime/Estate"), { near: "150% 0px", fetch: "near" });

/** Mounts the Estate film runtime for the scene `sceneId`: chapter numbers, and the gauge's feet and chapter. */
export function EstateMotion(props: { sceneId: string; chapters: string[]; gaugeFeet: number; gaugeChapter: number }) {
  return <Motion {...props} />;
}
