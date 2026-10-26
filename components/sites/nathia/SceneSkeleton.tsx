import type { CSSProperties } from "react";
import { PinnedSection } from "@/components/motion";
import type { NathiaScene, NathiaSite } from "@/content/nathia/schema";
import { sceneLayout, surfaceStyle } from "./scenes";
import { label, mono } from "./tokens";

export interface SceneProps {
  scene: NathiaScene;
  /** Chapter number and name for scenes that are chapters (explorer and returns are not). */
  chapter?: { no: string; name: string };
  /** All scenes on the page, for scenes that show a neighbour's content (the Ascent flank: the manifesto). */
  scenes: NathiaScene[];
  /** The page's chapters, for a neighbour's chapter number. */
  chapters: { id: string; no: string; name: string }[];
  /** Site facts (project links such as the explorer URL). */
  site: NathiaSite;
}

/**
 * Step 3 placeholder for every scene: the right id, surface, chapter and scroll length, no content yet.
 * Pinned scenes use PinnedSection with the measured lengths; the rest keep the measured live height.
 */
export function SceneSkeleton({ scene, chapter }: SceneProps) {
  const layout = sceneLayout[scene.type];
  const { className, tone } = surfaceStyle[layout.surface];
  const data = { "data-scene": scene.type, "data-tone": tone, "data-chapter": chapter?.no } as const;
  const placeholder = (
    <div className="flex h-full max-h-svh min-h-0 flex-col items-center justify-center gap-3">
      <p className={mono}>{chapter ? `${chapter.no} · ${chapter.name}` : scene.type}</p>
      <p className={`${label} opacity-60`}>Scene placeholder</p>
    </div>
  );

  if (layout.pin) {
    return (
      <PinnedSection id={scene.id} length={layout.pin.desktop} mobileLength={layout.pin.mobile} className={className} {...data}>
        {placeholder}
      </PinnedSection>
    );
  }
  const height = layout.height!;
  return (
    <section
      id={scene.id}
      data-fixed-height
      className={`${className} min-h-(--scene-h) max-[899px]:min-h-(--scene-h-mobile)`}
      style={{ "--scene-h": `${height.desktop}px`, "--scene-h-mobile": `${height.mobile}px` } as CSSProperties}
      {...data}
    >
      {/* One viewport tall, or the scene's height when that's shorter (register: 809px at 1440×900). */}
      <div className="sticky top-0 h-[min(100svh,var(--scene-h))] overflow-hidden max-[899px]:h-[min(100svh,var(--scene-h-mobile))]">{placeholder}</div>
    </section>
  );
}
