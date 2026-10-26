"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lazyMotion } from "@/components/motion/lazy";
import { useOverlayMenu } from "@/components/site/useOverlayMenu";
import { EXPLORER_EVENT, type ExplorerRequest } from "./explorer";
import { SceneLabel } from "./SceneLabel";
import { focusRing, gx } from "./tokens";

// The open/close animation (GSAP) loads after first paint; until then the overlay opens without animating.
const ExplorerDialogMotion = lazyMotion(() => import("./runtime/ExplorerDialog"));

/** Overlay animations, set by ExplorerDialogMotion once loaded and called from the open/close handlers. */
export type ExplorerFx = { enter?: () => void; exit?: () => unknown };

/**
 * The 3D explorer overlay [.xo] (CLAUDE.md §12): the live explorer app (nathia-reserve-explorer.vercel.app) in
 * an iframe, inside a native modal <dialog> (useOverlayMenu: focus trap, Escape closes, focus returns to the
 * control that opened it, Lenis stopped). The iframe loads only when the overlay first opens, and stays
 * loaded for the next opening. Bar: label, "open in a new tab" (hidden ≤ 720px) and Close; a breathing logo
 * and "Loading the explorer" until the app has loaded. Opened with openExplorer() (explorer.ts).
 */
export function ExplorerDialog({
  url,
  marker,
  label,
  newTab,
  close,
  loading,
}: {
  url: string;
  marker: string;
  label: string;
  newTab: string;
  close: string;
  loading: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const fx = useRef<ExplorerFx>({});
  const setFx = useCallback((handlers: ExplorerFx) => {
    fx.current = handlers;
  }, []);
  const { dialogRef, buttonRef, show, hide } = useOverlayMenu({
    enter: () => fx.current.enter?.(),
    exit: () => fx.current.exit?.(),
  });
  const [src, setSrc] = useState<string | null>(null);
  const srcRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const { path, trigger } = (e as CustomEvent<ExplorerRequest>).detail;
      const next = `${url}${path}`;
      if (srcRef.current !== next) {
        srcRef.current = next;
        setSrc(next);
        setLoaded(false);
      }
      // Focus returns to whatever opened it (portal button, window, menu pill).
      buttonRef.current = trigger as HTMLButtonElement | null;
      show();
    };
    window.addEventListener(EXPLORER_EVENT, onOpen);
    return () => window.removeEventListener(EXPLORER_EVENT, onOpen);
  }, [url, show, buttonRef]);

  return (
    <div ref={root}>
      <ExplorerDialogMotion root={root} onReady={setFx} />
      <dialog
        ref={dialogRef}
        aria-label={`The Nathia Reserve ${label}`}
        className="fixed inset-0 z-[97] m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-paper p-0 text-ink backdrop:bg-transparent"
      >
        {/* Grid on an inner wrapper: a display value on the <dialog> itself would show it while closed. */}
        <div className="grid h-full grid-rows-[auto_1fr]">
        {/* [.xo-bar]: 64px, bottom rule, .72rem, tracking .18em. */}
        <div className={`flex h-16 items-center justify-between border-b border-line text-[0.72rem] uppercase tracking-[0.18em] ${gx}`}>
          <SceneLabel no={marker} tone="dark" className="text-ink">
            {label}
          </SceneLabel>
          <div className="flex items-center gap-[22px]">
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative inline-flex items-center gap-[0.7em] pb-1.5 text-[0.78rem] font-medium after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:bg-current after:transition-transform after:duration-700 after:ease-[var(--theme-ease)] hover:after:scale-x-0 max-[720px]:hidden ${focusRing}`}
              >
                {newTab}
                <svg aria-hidden viewBox="0 0 18 10" className="h-[9px] w-4" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M0 5h17M12.5 0.5 17 5l-4.5 4.5" />
                </svg>
              </a>
            )}
            {/* [.xo-close]: 40px pill, rule border. */}
            <button type="button" onClick={() => void hide()} className={`inline-flex h-10 items-center gap-2.5 rounded-full border border-line px-[18px] uppercase tracking-[0.18em] ${focusRing}`}>
              {close}
            </button>
          </div>
        </div>
        {/* [.xo-frame] */}
        <div className="relative bg-surface-alt">
          {/* [.xo-wait]: breathing logo and a mono line until the app has loaded. */}
          <div
            aria-hidden={loaded}
            className="absolute inset-0 grid place-content-center place-items-center gap-[18px] font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-opacity duration-800"
            style={{ opacity: loaded ? 0 : 1 }}
          >
            <span className="h-16 w-[120px] animate-[nathia-breathe_2.4s_var(--theme-ease)_infinite_alternate] bg-accent [mask:url(/nathia/logo.svg)_50%/contain_no-repeat] motion-reduce:animate-none" />
            <span role="status">{loaded ? "" : loading}</span>
          </div>
          {src && (
            <iframe
              src={src}
              title={`The Nathia Reserve ${label}`}
              allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              className="absolute inset-0 size-full border-0"
            />
          )}
        </div>
        </div>
      </dialog>
    </div>
  );
}
