"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lazyMotion } from "@/components/motion/lazy";
import { useOverlayMenu } from "@/components/site/useOverlayMenu";
import { GALLERY_EVENT, openGallery, type GalleryRequest } from "./gallery";
import { focusRing } from "./tokens";
import { NathiaImg } from "./NathiaImg";

// The image fade (GSAP) loads after first paint; until then images swap without fading.
const GalleryLightboxMotion = lazyMotion(() => import("./runtime/GalleryLightbox"));

/** Lightbox animation, set by GalleryLightboxMotion once loaded: fades in the image element it is given. */
export type GalleryFx = { show?: (img: HTMLElement) => void };

type Item = { src: string; alt: string; caption: string };

/**
 * The gallery lightbox [.gl-lb]: one image at a time on a dark, blurred veil, with "01 / 12 · caption",
 * previous / next and Close along the bottom. Native modal <dialog> (useOverlayMenu: Tab trap, Escape closes,
 * focus returns to the item that opened it, Lenis stopped); ← / → step through, wrapping; a click anywhere but
 * the bar closes it, as live. Each image fades in from a slight zoom. Opened with openGallery() (gallery.ts).
 */
export function GalleryLightbox({
  items,
  controls,
}: {
  items: Item[];
  controls: { previous: string; next: string; close: string };
}) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const fx = useRef<GalleryFx>({});
  const setFx = useCallback((handlers: GalleryFx) => {
    fx.current = handlers;
  }, []);
  // No open/close animation on live: the veil appears at once, the image fades in.
  const { dialogRef, buttonRef, show, hide } = useOverlayMenu({ enter: () => {}, exit: () => {} });
  const [index, setIndex] = useState<number | null>(null);
  const step = useCallback((by: number) => setIndex((i) => (i === null ? i : (i + by + items.length) % items.length)), [items.length]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const { index: i, trigger } = (e as CustomEvent<GalleryRequest>).detail;
      buttonRef.current = trigger as HTMLButtonElement | null;
      setIndex(i);
      show();
    };
    // The gallery's items are plain server-rendered buttons ([data-gallery-open="<index>"]): one delegated
    // listener opens the lightbox for all of them, so none needs hydrating.
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element | null)?.closest<HTMLElement>("[data-gallery-open]");
      if (button) openGallery(Number(button.dataset.galleryOpen), button);
    };
    window.addEventListener(GALLERY_EVENT, onOpen);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener(GALLERY_EVENT, onOpen);
      document.removeEventListener("click", onClick);
    };
  }, [show, buttonRef]);

  // Every image shown (on open and on each step) fades in.
  useEffect(() => {
    if (index !== null && frame.current) fx.current.show?.(frame.current);
  }, [index]);

  const item = index === null ? null : items[index];
  const arrow = (dir: "left" | "right") => (
    <svg aria-hidden viewBox="0 0 16 9" className={`h-[9px] w-4 ${dir === "left" ? "-scale-x-100" : ""}`} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 4.5h15M11 0.5l4 4-4 4" />
    </svg>
  );
  const navButton = `grid h-11 min-w-11 place-items-center rounded-full border border-line px-3.5 ${focusRing}`;

  return (
    <div ref={root}>
      <GalleryLightboxMotion root={root} onReady={setFx} />
      <dialog
        ref={dialogRef}
        aria-label={item?.alt}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        // A click on the veil or the image closes it; the bar stops its clicks.
        onClick={() => void hide()}
        className="fixed inset-0 z-[96] m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-paper/94 p-0 text-ink backdrop-blur-[8px] backdrop:bg-transparent"
      >
        {/* Grid on an inner wrapper: a display value on the <dialog> itself would show it while closed. */}
        <div className="grid h-full place-items-center">
          {item && (
            <div ref={frame} className="relative h-[80vh] w-[88vw]">
              <NathiaImg key={item.src} file={item.src} alt={item.alt} sizes="88vw" className="rounded-[2px] object-contain" />
            </div>
          )}
          {/* [.gl-lb-bar]: along the bottom, within the page gutter. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-[4vh] inset-x-[clamp(20px,4.2vw,72px)] flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em]"
          >
            <span className="font-mono">
              {String((index ?? 0) + 1).padStart(2, "0")} / {items.length} · {item?.caption}
            </span>
            <span className="flex items-center gap-2.5">
              <button type="button" aria-label={controls.previous} onClick={() => step(-1)} className={navButton}>
                {arrow("left")}
              </button>
              <button type="button" aria-label={controls.next} onClick={() => step(1)} className={navButton}>
                {arrow("right")}
              </button>
              <button type="button" onClick={() => void hide()} className={navButton}>
                {controls.close}
              </button>
            </span>
          </div>
        </div>
      </dialog>
    </div>
  );
}
