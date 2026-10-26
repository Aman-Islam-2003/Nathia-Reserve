import type { CSSProperties } from "react";
import { ClipReveal, Parallax, RiseLines } from "@/components/motion";
import { GalleryLightbox } from "../GalleryLightbox";
import { renderLines } from "../line";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { surfaceStyle } from "../scenes";
import { display, displayEm, focusRing, galleryTiming as t, gx, sectionTiming } from "../tokens";
import { NathiaImg } from "../NathiaImg";

/** Live column offsets on desktop [.gl-col:nth-child(2..4)]: 0, 12vh, 4vh, 16vh. */
const columnOffset = ["", "mt-[12vh]", "mt-[4vh]", "mt-[16vh]"];

/**
 * Scene 08, First Look [section.gl]: the heading, then twelve images in four columns that drift at different
 * speeds (desktop); each opens from an inset frame as it scrolls in while its photo settles. Each image opens
 * the lightbox. Mobile: two columns, every frame 4:5, no drift. Reduced motion: static frames.
 */
export function Gallery({ scene, chapter }: SceneProps) {
  if (scene.type !== "gallery") return null;
  const { className, tone } = surfaceStyle.ink;
  // Column c holds items c, c + 4, c + 8 (as live), so the grid reads across in a staggered order.
  const columns = [0, 1, 2, 3].map((c) => scene.items.map((_, i) => i).filter((i) => i % 4 === c));

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      className={`relative overflow-hidden pt-[18vh] pb-[16vh] max-[899px]:pt-[12vh] max-[899px]:pb-[10vh] ${className}`}
    >
      <header className={`grid gap-[3vh] ${gx}`}>
        <SceneLabel no={scene.marker ?? chapter?.no ?? ""} tone="light">
          {scene.label}
        </SceneLabel>
        <RiseLines
          lines={renderLines(scene.heading, `${displayEm} text-accent-on-ink`)}
          trigger="section"
          at={sectionTiming.headAt.gallery}
          duration={sectionTiming.headDuration}
          className={`${display} text-[clamp(3rem,8vw,9.6rem)]`}
        />
      </header>

      <div className={`mt-[10vh] grid grid-cols-4 items-start gap-[1.4vw] max-[899px]:mt-[6vh] max-[899px]:grid-cols-2 max-[899px]:gap-3 ${gx}`}>
        {columns.map((column, c) => (
          <Parallax
            key={c}
            drift={{ yPercent: [t.columnDrift[c], -t.columnDrift[c]] }}
            media="(min-width: 900px)"
            className={`grid gap-[1.4vw] will-change-transform max-[899px]:contents ${columnOffset[c]}`}
          >
            {column.map((i, row) => {
              const item = scene.items[i];
              return (
                // A plain button: GalleryLightbox opens it through one delegated click listener.
                <button
                  key={item.img}
                  type="button"
                  data-gallery-open={i}
                  data-cursor="View"
                  aria-label={`${scene.controls.open}: ${item.alt}`}
                  style={{ "--ar": t.aspects[(c + row) % t.aspects.length] } as CSSProperties}
                  className={`group grid gap-3 text-left ${focusRing}`}
                >
                  {/* [.gl-frame]: aspect ratio cycles by column and row; 4:5 on mobile. */}
                  <ClipReveal
                    from={t.itemFrom}
                    to={t.itemTo}
                    scrub={t.itemScrub}
                    className="relative block aspect-[var(--ar)] rounded-[4px] after:absolute after:inset-0 after:bg-paper/0 after:transition-colors after:duration-800 group-hover:after:bg-paper/12 max-[899px]:aspect-[4/5]"
                  >
                    {/* The scale follows the whole item (photo and caption) across the screen, as live [.gl-item]. */}
                    <Parallax drift={{ yPercent: [0, 0], scale: [...t.photoScale] }} range={{ start: "top bottom", end: "bottom top", closest: "[data-gallery-open]" }} className="absolute inset-0">
                      <NathiaImg name={item.img} alt="" sizes="(min-width: 900px) 24vw, 48vw" className="object-cover" />
                    </Parallax>
                  </ClipReveal>
                  {/* [.gl-cap] */}
                  <span className="flex gap-3 text-[0.8rem] font-medium tracking-[0.04em]">
                    <span className="font-mono text-[0.7rem] text-accent-on-ink">{String(i + 1).padStart(2, "0")}</span>
                    {item.caption}
                  </span>
                </button>
              );
            })}
          </Parallax>
        ))}
      </div>

      <GalleryLightbox
        items={scene.items.map((item) => ({ src: `/nathia/img/${item.img}-lg.webp`, alt: item.alt, caption: item.caption }))}
        controls={scene.controls}
      />
    </section>
  );
}
