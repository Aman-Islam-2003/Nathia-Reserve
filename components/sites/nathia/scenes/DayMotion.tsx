"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The Day runtime (GSAP timeline, WebGL wipe) is fetched and mounted when the scene is about 1.5 viewports
// away, as live loads its photos [Day: whenNear 150%]; nothing of it loads with the page.
const Motion = lazyMotion(() => import("../runtime/Day"), { near: "150% 0px", fetch: "near" });

export type DayMoment = { img: string; time: string };

/** Mounts the Day runtime for the scene with `sceneId`; `moments`: each one's photo and time. */
export function DayMotion({ sceneId, moments }: { sceneId: string; moments: DayMoment[] }) {
  return <Motion sceneId={sceneId} moments={moments} />;
}
