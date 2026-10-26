"use client";

import type { RefObject } from "react";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import type { ExplorerFx } from "../ExplorerDialog";
import { explorerTiming } from "../tokens";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FULL = "inset(0% 0% 0% 0% round 0px)";

/**
 * Explorer overlay motion (loaded after first paint), measured on live [.xo]: opens from a rounded inner
 * frame (inset 18% 22%, 28px radius) to full screen over 1.05 s, ease "reserve" (theme easeInOut); closes
 * back to that frame over .8 s. Reduced motion: a plain fade. Renders nothing; hands the handlers to the
 * dialog through onReady.
 */
export default function ExplorerDialogMotion({ root, onReady }: { root: RefObject<HTMLDivElement | null>; onReady: (fx: ExplorerFx) => void }) {
  const motion = useRuntimeMotion();

  useGSAP(
    (_, contextSafe) => {
      const safe = contextSafe!;
      const dialog = () => root.current?.querySelector("dialog") ?? null;
      const reduced = () => window.matchMedia(REDUCED).matches;
      onReady({
        enter: safe(() => {
          const d = dialog();
          if (!d) return;
          if (reduced()) gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: motion.durations.fade, ease: motion.easeSoft });
          else gsap.fromTo(d, { clipPath: explorerTiming.frame, opacity: 1 }, { clipPath: FULL, duration: explorerTiming.open, ease: motion.easeInOut });
        }),
        exit: safe(() => {
          const d = dialog();
          if (!d) return;
          return reduced()
            ? gsap.to(d, { opacity: 0, duration: motion.durations.fade, ease: motion.easeSoft })
            : gsap.to(d, { clipPath: explorerTiming.frame, duration: explorerTiming.close, ease: motion.easeInOut });
        }),
      });
      return () => onReady({});
    },
    { scope: root, dependencies: [motion, onReady] },
  );

  return null;
}
