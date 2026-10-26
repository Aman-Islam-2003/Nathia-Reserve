"use client";

import type { RefObject } from "react";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import type { GalleryFx } from "../GalleryLightbox";
import { galleryTiming } from "../tokens";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Gallery lightbox motion (loaded after first paint), measured on live [.gl-lb-img]: each image fades in from
 * scale 1.04 over .9 s, ease "reserveOut" (the theme ease). Reduced motion: a plain fade. Renders nothing;
 * hands the handler to the lightbox through onReady.
 */
export default function GalleryLightboxMotion({ root, onReady }: { root: RefObject<HTMLDivElement | null>; onReady: (fx: GalleryFx) => void }) {
  const motion = useRuntimeMotion();

  useGSAP(
    (_, contextSafe) => {
      const safe = contextSafe!;
      onReady({
        show: safe((img: HTMLElement) => {
          // Opacity on the soft ease, the settle (a transform) on the brand ease.
          gsap.fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: galleryTiming.lightboxFade, ease: motion.easeSoft, overwrite: true });
          if (!window.matchMedia(REDUCED).matches) {
            gsap.fromTo(img, { scale: 1.04 }, { scale: 1, duration: galleryTiming.lightboxFade, ease: motion.ease });
          }
        }),
      });
      return () => onReady({});
    },
    { scope: root, dependencies: [motion, onReady] },
  );

  return null;
}
