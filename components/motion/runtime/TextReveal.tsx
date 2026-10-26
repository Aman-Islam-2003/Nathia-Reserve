"use client";

import type { RefObject } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { claimReveal, onReplay, whenNear, type DurKey } from "../shared";
import type { Split } from "../TextReveal";
import { isInView, revealTrigger, useRuntimeMotion } from "./shared";

/**
 * How far (in em) each line mask's clip extends beyond its box. Glyphs overflow the line box
 * when line-height < ~1.2 (descenders, ascenders, accents), so a tight clip would cut them.
 * 0.35em covers line-heights down to ~0.8 with tall display faces.
 */
const MASK_BLEED_EM = 0.35;
const MASK_CLASS = "split-line-mask"; // SplitText names masks `${linesClass}-mask`

const splitType: Record<Split, string> = {
  lines: "lines",
  words: "lines,words",
  chars: "lines,words,chars", // words keep chars from breaking mid-word across lines
};

/** TextReveal's animation (loaded after first paint). Renders nothing; animates `target`. */
export default function TextRevealMotion({
  target,
  split,
  duration,
  stagger,
}: {
  target: RefObject<HTMLElement | null>;
  split: Split;
  duration: DurKey;
  stagger?: number;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = target.current;
      // Already shown by revealFallback (on screen before this loaded): leave it static.
      if (!el || claimReveal(el)) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        let anim: gsap.core.Tween | undefined;

        // Lazy: split only when the element is about a viewport away (see whenNear).
        const init = ctx.add("init", () => {
          SplitText.create(el, {
            type: splitType[split],
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            // Re-runs after resize/font load; returning the tween lets SplitText carry its progress over.
            onSplit(self) {
              // 1) Read everything first (one layout), 2) then write. Reading a mask's size per unit after
              // the style writes below forced a layout for every word/line.
              const masks = self.masks as HTMLElement[];
              const travel = new Map(
                masks.map((m) => [m, m.offsetHeight + 2 * MASK_BLEED_EM * parseFloat(getComputedStyle(m).fontSize)]),
              );
              const scrollTrigger = revealTrigger(el); // reads the element's position

              // Extend the clip outward instead of resizing the mask, so layout is unchanged
              // (padding + negative margin would collapse between stacked line masks).
              gsap.set(masks, { overflow: "visible", clipPath: `inset(-${MASK_BLEED_EM}em -${MASK_BLEED_EM}em)` });

              anim = gsap.from(self[split], {
                // Start below the extended clip: one mask height plus the bleed above and below.
                y: (_: number, unit: Element) => travel.get(unit.closest<HTMLElement>(`.${MASK_CLASS}`)!) ?? 0,
                duration: motion.dur[duration],
                ease: motion.ease,
                stagger: stagger ?? (split === "lines" ? motion.stagger.items : motion.stagger[split]),
                // On screen now → play right away; otherwise on enter.
                scrollTrigger,
              });
              gsap.set(el, { autoAlpha: 1 });
              return anim;
            },
          });
        });

        const stop = whenNear(el, () => init());
        const offReplay = onReplay(() => anim);
        return () => {
          stop();
          offReplay();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (isInView(el)) return;
        const anim = gsap.from(el, {
          autoAlpha: 0,
          duration: motion.dur.fast,
          ease: motion.easeSoft,
          scrollTrigger: revealTrigger(el),
        });
        return onReplay(() => anim);
      });
    },
    { scope: target, dependencies: [motion, split, duration, stagger], revertOnUpdate: true },
  );

  return null;
}
