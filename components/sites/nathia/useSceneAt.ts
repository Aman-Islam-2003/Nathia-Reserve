"use client";

import { useEffect, useState } from "react";

export interface SceneInfo {
  scene: string | null;
  tone: "dark" | "light";
  /** Chapter number of the scene on the line, or of the last chapter scene above it (explorer/returns). */
  chapter: string | null;
}

/**
 * The scene ([data-scene]) crossing a horizontal line: at `line` of the viewport height (0 = top, 1 = bottom),
 * or `{ px }` from the top. IntersectionObserver with a root margin that leaves a 1px band at that line: no
 * scroll listeners, no layout reads per frame. Pinned scenes keep intersecting the line for their whole pin.
 */
export function useSceneAt(line: number | { px: number }): SceneInfo {
  const fraction = typeof line === "number" ? line : null;
  const px = typeof line === "number" ? null : line.px;
  const [info, setInfo] = useState<SceneInfo>({ scene: null, tone: "dark", chapter: null });

  useEffect(() => {
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    if (!scenes.length) return;
    const lastChapterUpTo = (el: HTMLElement) => {
      for (let i = scenes.indexOf(el); i >= 0; i--) if (scenes[i].dataset.chapter) return scenes[i].dataset.chapter!;
      return null;
    };
    let current: HTMLElement | null = null;
    const report = (el: HTMLElement) => {
      current = el;
      setInfo({ scene: el.dataset.scene ?? null, tone: el.dataset.tone === "light" ? "light" : "dark", chapter: lastChapterUpTo(el) });
    };
    const margin = () => {
      if (px === null) {
        const top = Math.round((fraction ?? 0) * 100);
        return `-${top}% 0px -${Math.max(0, 99 - top)}% 0px`;
      }
      return `-${px}px 0px -${Math.max(0, window.innerHeight - px - 1)}px 0px`;
    };
    let io: IntersectionObserver;
    const observe = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          const hit = entries.filter((e) => e.isIntersecting).at(-1);
          if (hit) report(hit.target as HTMLElement);
        },
        { rootMargin: margin() },
      );
      scenes.forEach((s) => io.observe(s));
    };
    observe();
    // A pixel line's bottom margin depends on the viewport height.
    const onResize = () => px !== null && observe();
    window.addEventListener("resize", onResize);
    // A pinned scene can change its tone or chapter mid-scene (the Ascent turns light as it hands over to the
    // manifesto); the line doesn't cross anything then, so watch those attributes too.
    const mo = new MutationObserver((records) => {
      for (const r of records) if (r.target === current) report(current);
    });
    scenes.forEach((s) => mo.observe(s, { attributes: true, attributeFilter: ["data-tone", "data-chapter"] }));
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [fraction, px]);

  return info;
}
