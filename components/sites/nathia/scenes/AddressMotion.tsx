"use client";

import { lazyMotion } from "@/components/motion/lazy";
import { addressLoadMargin } from "../tokens";

// The Address timeline (GSAP) and map loader are fetched and mounted four viewports ahead, as live starts
// loading the map (nothing at page load); the map itself (three.js) is a further dynamic import from the
// runtime, on capable devices only.
const Motion = lazyMotion(() => import("../runtime/Address"), { near: addressLoadMargin, fetch: "near" });

/** Mounts the Address runtime for the scene with `sceneId`. */
export function AddressMotion({ sceneId }: { sceneId: string }) {
  return <Motion sceneId={sceneId} />;
}
