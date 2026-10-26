"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Magnetic } from "@/components/motion";
import { lazyMotion } from "@/components/motion/lazy";
import { useOverlayMenu } from "@/components/site/useOverlayMenu";
import { openExplorer } from "./explorer";
import type { NathiaSite } from "@/content/nathia/schema";
import { focusRing, gx, label, magnetic, navHeight, navPill, pillHover, sceneLine } from "./tokens";
import { useSceneAt } from "./useSceneAt";
import { NathiaImg } from "./NathiaImg";

// Menu curtain and link rise (GSAP) load after first paint; until then the menu opens without animating.
const NathiaMenuMotion = lazyMotion(() => import("./runtime/NathiaMenu"));
// Hide on scroll down / show on scroll up (live .nav.is-hidden).
const NathiaNavMotion = lazyMotion(() => import("./runtime/NathiaNav"));

/** Menu animations, set by NathiaMenuMotion once loaded and called from event handlers. */
export type NathiaMenuFx = { enter?: () => void; exit?: () => unknown };


/**
 * Fixed header [.nav]: logo, Register interest pill and Menu button, transparent over every scene. Turns forest
 * over light (bone) scenes [.nav-logo color: --forest]. The menu is a full-screen curtain [.menu]: an image
 * column that crossfades per hovered link, numbered chapter links with sub-labels, the 3D explorer pill and
 * address / enquiries / "you are here" columns. Mobile: no image column, no sub-labels.
 */
export function NathiaHeader({ site }: { site: NathiaSite }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const fx = useRef<NathiaMenuFx>({});
  const setFx = useCallback((handlers: NathiaMenuFx) => {
    fx.current = handlers;
  }, []);
  const { dialogRef, buttonRef, open, show, hide, onLinkClick } = useOverlayMenu({
    enter: () => fx.current.enter?.(),
    exit: () => fx.current.exit?.(),
  });
  const [active, setActive] = useState(0);
  // Tone and "you are here" from the scene under the 44px line, as live reads both.
  const here = useSceneAt(sceneLine);
  const { tone } = here;
  const chapter = site.chapters.find((c) => c.no === here.chapter) ?? site.chapters[0];
  const color = !open && tone === "light" ? "text-on-ink" : "text-ink";

  const logo = (size: string) => (
    <span
      aria-hidden
      // The logo SVG used as a mask, filled with the current colour [.nav-logo: mask url(/logo.svg)].
      className={`block ${size} bg-current [mask:url(/nathia/logo.svg)_50%/contain_no-repeat]`}
    />
  );

  return (
    <div ref={root}>
      <NathiaMenuMotion root={root} onReady={setFx} />
      <NathiaNavMotion header={bar} />
      {/* Hidden until the preloader exits; its logo flies into [data-preloader-target]. */}
      <header ref={bar} data-hide-while-loading className={`fixed inset-x-0 top-0 z-[60] flex items-center justify-between ${navHeight} ${gx} ${color} transition-[color,opacity] duration-600`}>
        <Link href="/nathia" aria-label="The Nathia Reserve, home" data-preloader-target className={`rounded-sm ${!open && tone === "light" ? "text-on-ink" : "text-accent"} ${focusRing}`}>
          {logo("h-[51px] w-[96px] max-[899px]:h-10 max-[899px]:w-[74px]")}
        </Link>
        <div className="flex items-center gap-3.5">
          <Magnetic {...magnetic}>
            <Link href="/nathia/register" className={`${navPill} ${pillHover} ${focusRing}`}>
              Register interest
            </Link>
          </Magnetic>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={show}
            className={`inline-flex h-11 items-center gap-3.5 pr-1 pl-3 text-xs font-medium uppercase tracking-[0.22em] ${focusRing}`}
          >
            <span className="max-[899px]:sr-only">Menu</span>
            {/* Two lines that cross into an X when open [.nav-menu-icon]. */}
            <span aria-hidden className="relative block h-2.5 w-[26px]">
              <i className="absolute inset-x-0 top-0 h-px bg-current" />
              <i className="absolute inset-x-0 top-[9px] h-px bg-current" />
            </span>
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="The Nathia Reserve menu"
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-surface-alt p-0 text-ink backdrop:bg-transparent"
      >
        {/* The modal dialog renders above the page header, so it carries its own bar (same layout): logo,
            Register interest, Close. On the live site the header stays above the menu [.nav z 60, .menu z 55]. */}
        <div className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between ${navHeight} ${gx}`}>
          <Link href="/nathia" aria-label="The Nathia Reserve, home" onClick={() => void hide({ focusButton: false })} className={`rounded-sm text-accent ${focusRing}`}>
            {logo("h-[51px] w-[96px] max-[899px]:h-10 max-[899px]:w-[74px]")}
          </Link>
          <div className="flex items-center gap-3.5">
            <Link href="/nathia/register" onClick={() => void hide({ focusButton: false })} className={`${navPill} ${pillHover} ${focusRing}`}>
              Register interest
            </Link>
            <button type="button" onClick={() => void hide()} className={`inline-flex h-11 items-center gap-3.5 pr-1 pl-3 text-xs font-medium uppercase tracking-[0.22em] ${focusRing}`}>
              <span className="max-[899px]:sr-only">Close</span>
              <span aria-hidden className="relative block h-2.5 w-[26px]">
                <i className="absolute inset-x-0 top-[5px] h-px rotate-[20deg] bg-current" />
                <i className="absolute inset-x-0 top-[5px] h-px -rotate-[20deg] bg-current" />
              </span>
            </button>
          </div>
        </div>
        <div className="grid h-full grid-cols-[1fr_1.15fr] max-[899px]:grid-cols-1">
        {/* Image column: one image per link, crossfading on hover/focus [.menu-media]. Decorative. */}
        <div aria-hidden className="relative overflow-hidden max-[899px]:hidden">
          {site.nav.map((item, i) => (
            <NathiaImg
              key={item.href}
              file={`/nathia/img/${item.img}-lg.webp`}
              alt=""
              sizes="47vw"
              className={`object-cover transition-[opacity,transform] duration-[900ms,1600ms] ease-[var(--theme-ease-in-out),var(--theme-ease)] ${i === active ? "scale-100 opacity-100" : "scale-[1.12] opacity-0"}`}
            />
          ))}
          {/* Fades into the panel along its right edge, as on the live menu. */}
          <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-r from-transparent to-surface-alt" />
        </div>

        {/* [.menu-body]: padding nav-h + 4vh top, gutter sides, 5vh bottom. */}
        <div className={`flex flex-col justify-between overflow-y-auto pt-[calc(84px+4vh)] pb-[5vh] max-[899px]:pt-[calc(68px+4vh)] ${gx}`}>
          <nav aria-label="Menu">
            <ul>
              {site.nav.map((item, i) => (
                <li key={item.href} data-menu-item>
                  <a
                    href={item.href}
                    onClick={onLinkClick}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    // [.menu-link]: grid 3.2em | 1fr | auto, baseline, 1.1vh padding, line below. Mobile 2.6em | 1fr.
                    className={`group grid grid-cols-[3.2em_1fr_auto] items-baseline gap-[0.6em] border-b border-line py-[1.1vh] max-[899px]:grid-cols-[2.6em_1fr] ${focusRing}`}
                  >
                    <span className="overflow-hidden">
                      <span data-menu-rise className="block font-mono text-[0.72rem] text-accent">{item.no}</span>
                    </span>
                    <span className="overflow-hidden">
                      {/* Hover [.menu-link:hover .menu-link-title]: 14px right (.7s ease-out), italic, tan-2 (.5s). */}
                      <span
                        data-menu-rise
                        className="block font-display text-[clamp(2rem,4.4vw,4.4rem)] font-semibold leading-[1.05] transition-[translate,color] duration-[700ms,500ms] ease-[var(--theme-ease),ease] group-hover:translate-x-3.5 group-hover:text-accent-soft group-hover:italic"
                      >
                        {item.title}
                      </span>
                    </span>
                    <span data-menu-fade className="text-[0.72rem] uppercase tracking-[0.18em] opacity-60 max-[899px]:hidden">
                      {item.sub}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-[3vh] flex flex-col gap-[0.8vh] max-[899px]:gap-[2.6vh]">
            <a
              data-menu-fade
              href={site.project.explorerUrl}
              target="_blank"
              rel="noopener"
              // With JS (as live): close the menu, then open the explorer overlay; focus returns to Menu.
              onClick={(e) => {
                e.preventDefault();
                void hide({ focusButton: false }).then(() => openExplorer(buttonRef.current));
              }}
              className={`inline-flex h-[52px] items-center gap-[0.9em] self-start rounded-full border border-current px-[26px] text-[0.78rem] font-medium uppercase tracking-[0.18em] ${pillHover} ${focusRing}`}
            >
              3D Explorer
              <svg aria-hidden viewBox="0 0 18 10" className="h-2.5 w-[18px]" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M0 5h17M12.5 0.5 17 5l-4.5 4.5" />
              </svg>
            </a>
            {/* [.menu-foot]: three columns, gap 3vw, .86rem / 1.6, opacity .85; one column on mobile. */}
            <div data-menu-fade className="grid grid-cols-[repeat(3,auto)] justify-between gap-[3vw] text-[0.86rem] leading-[1.6] opacity-85 max-[899px]:grid-cols-1 max-[899px]:gap-[2vh]">
              <div>
                <span className={`${label} mb-2 block opacity-60`}>Address</span>
                <p>
                  {site.project.road}
                  <br />
                  {site.project.address}
                </p>
              </div>
              <div>
                <span className={`${label} mb-2 block opacity-60`}>Enquiries</span>
                <p>
                  {site.enquiries.email}
                  <br />
                  {site.enquiries.instagram}
                </p>
              </div>
              <div>
                <span className={`${label} mb-2 block opacity-60`}>You are here</span>
                <p>
                  {chapter.no} / {String(site.chapters.length).padStart(2, "0")} · {chapter.name}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </dialog>
    </div>
  );
}
