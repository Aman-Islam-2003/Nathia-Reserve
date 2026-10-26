// Single place where GSAP plugins are registered. Import GSAP from here, never from "gsap" directly.
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { themeEase, themeEaseInOut, themeEaseSoft, themeNames, themes } from "@/themes";

// Plugins only: no other module's values are read at load time.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);
}

/** True when the visitor asked their device for less motion. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let easesRegistered = false;

/**
 * Registers every theme's eases with CustomEase, once. Called from useMotion(), which runs
 * during render, before any useGSAP effect that might use the ease names.
 */
export function ensureThemeEases() {
  if (easesRegistered || typeof window === "undefined") return;
  for (const name of themeNames) {
    const { ease, easeSoft, easeInOut } = themes[name].motion;
    CustomEase.create(themeEase(name), ease.join(","));
    CustomEase.create(themeEaseSoft(name), easeSoft.join(","));
    CustomEase.create(themeEaseInOut(name), easeInOut.join(","));
  }
  easesRegistered = true;
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
