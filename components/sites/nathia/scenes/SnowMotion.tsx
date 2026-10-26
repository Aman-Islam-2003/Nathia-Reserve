"use client";

import { lazyMotion } from "@/components/motion/lazy";

// The Snow runtime (pin timeline, WebGL snow, video) is fetched and mounted when the scene is about 1.5 viewports
// away [live: whenNear 150%]; nothing of it loads with the page.
const Motion = lazyMotion(() => import("../runtime/Snow"), { near: "150% 0px", fetch: "near" });

/** Mounts the Snow runtime for the scene `sceneId`; `count`: the value the counter rolls to. */
export function SnowMotion(props: { sceneId: string; count: number }) {
  return <Motion {...props} />;
}
