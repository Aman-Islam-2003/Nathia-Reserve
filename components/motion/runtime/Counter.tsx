"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { claimReveal, onReplay, whenNear, type DurKey } from "../shared";
import { revealTrigger, useRuntimeMotion } from "./shared";

/** Counter's animation (loaded after first paint). Renders nothing; writes into `value`'s text node. */
export default function CounterMotion({
  target,
  value,
  text,
  from,
  to,
  duration,
}: {
  target: RefObject<HTMLSpanElement | null>;
  value: RefObject<HTMLSpanElement | null>;
  text: (n: number) => string;
  from: number;
  to: number;
  duration: DurKey;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = target.current;
      // Already shown by revealFallback (on screen before this loaded): keep the final value.
      if (!el || claimReveal(el)) return;
      // Write to React's own text node so later renders still update it.
      const write = (s: string) => {
        const node = value.current?.firstChild;
        if (node) node.nodeValue = s;
      };
      const mm = gsap.matchMedia();

      // Reduced motion: no branch, the server-rendered final value stays.
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        let tween: gsap.core.Tween | undefined;
        // Lazy: set up the count only when the element is about a viewport away (see whenNear).
        const init = ctx.add("init", () => {
          const state = { n: from };
          const scrollTrigger = revealTrigger(el); // read before the writes below
          write(text(from));
          gsap.set(el, { autoAlpha: 1 });
          tween = gsap.to(state, {
            n: to,
            duration: motion.dur[duration],
            // Soft ease: an overshoot would briefly show a number larger than the final one.
            ease: motion.easeSoft,
            onUpdate: () => write(text(state.n)),
            scrollTrigger,
          });
        });
        const stop = whenNear(el, () => init());
        const offReplay = onReplay(() => tween);
        return () => {
          stop();
          offReplay();
          write(text(to));
        };
      });
    },
    { scope: target, dependencies: [motion, text, from, to, duration], revertOnUpdate: true },
  );

  return null;
}
