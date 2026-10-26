import type { ReactNode } from "react";
import { Cursor, PageTransition } from "@/components/motion";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AmbientSound } from "./AmbientSound";
import { ScrollFeel } from "./ScrollFeel";
import { cursorTiming, curtainTiming, grainNoise } from "./tokens";

/**
 * Site-wide effects on every /nathia page, mounted once in app/nathia/layout.tsx so they persist across routes
 * (as live's Shell): the skip link, film grain, cursor, route curtain, ambient sound engine and smooth-scroll
 * feel. Pages render their own header, HUD and footer inside.
 */
export function NathiaChrome({ fonts, children }: { fonts: string; children: ReactNode }) {
  // leading-[1.6]: live's body line height [body { line-height: 1.6 }], inherited by all text without its own.
  return (
    <ThemeProvider theme="nathia" className={`${fonts} flex flex-1 flex-col leading-[1.6]`}>
      {/* [.skip]: bone on ink, hidden above the top until focused. */}
      <a href="#main" className="fixed -top-[60px] left-3 z-[200] bg-ink px-4 py-2.5 text-paper focus:top-3">
        Skip to content
      </a>
      {children}
      {/* [.cursor]: 6px tan-2 dot; 84px bone ring (94%, 4px backdrop blur) with a .6rem 600 label, tracking .2em. */}
      <Cursor
        timing={cursorTiming}
        className="z-[95]"
        dotClassName="-mt-[3px] -ml-[3px] size-1.5 rounded-full bg-accent-soft"
        ringClassName="-mt-[42px] -ml-[42px] size-[84px] rounded-full bg-ink/94 text-[0.6rem] font-semibold tracking-[0.2em] text-paper uppercase backdrop-blur-[4px]"
      />
      {/* [.curtain]: forest panel over everything but dialogs and the preloader, with the tan logo (120 × 64). */}
      <PageTransition timing={curtainTiming} className="z-[98] bg-surface-alt">
        <span className="block h-16 w-[120px] bg-accent [mask:url(/nathia/logo.svg)_50%/contain_no-repeat]" />
      </PageTransition>
      <AmbientSound />
      <ScrollFeel />
      {/* [.grain]: white film grain over the whole page at 7%, flickering (static with reduced motion). */}
      <div
        aria-hidden
        data-grain
        data-print="hide"
        className="pointer-events-none fixed -inset-1/2 z-[90] animate-[nathia-grain_0.9s_steps(5,end)_infinite] opacity-7 motion-reduce:animate-none"
        style={{ backgroundImage: grainNoise }}
      />
    </ThemeProvider>
  );
}
