"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { chapters, type Tone } from "@/content/site";

type Active = { index: number; id: string; label: string; tone: Tone };
const first: Active = { index: 0, id: chapters[0].id, label: chapters[0].label, tone: chapters[0].tone };
const ChapterContext = createContext<Active>(first);
export const useChapter = () => useContext(ChapterContext);

/** Watches every <section data-chapter> and reports which one sits under the header. */
export function ChapterProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Active>(first);

  useEffect(() => {
    const triggers = chapters.map((c, index) => {
      const el = document.getElementById(c.id);
      if (!el) return null;
      const set = () => setActive({ index, id: c.id, label: c.label, tone: c.tone });
      return ScrollTrigger.create({
        trigger: el,
        start: "top 60px",
        end: "bottom 60px",
        onEnter: set,
        onEnterBack: set,
      });
    });
    // sections above pin spacers may shift; refresh once everything has laid out
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(id);
      triggers.forEach((t) => t?.kill());
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.tone = active.tone;
  }, [active.tone]);

  return <ChapterContext.Provider value={active}>{children}</ChapterContext.Provider>;
}
