"use client";

import { chapters } from "@/content/site";
import { useChapter } from "@/components/providers/ChapterProvider";

/** "03 / 10 · The Measure" — tells the visitor where they are in the story. */
export function ChapterHUD() {
  const { index, label } = useChapter();
  return (
    <div className="hud" aria-live="polite">
      <span className="hud__count">{String(index + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span>
      <span className="hud__line" aria-hidden="true" />
      <span key={label} className="hud__label">{label}</span>
    </div>
  );
}
