"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { explorerPath, levelName, type Explorer, type ExplorerSelection, type ExplorerTower } from "@/content/nathia/explorer";
import { focusRing, label } from "../tokens";
import type { ExplorerScene, Hit } from "./runtime/scene";

/**
 * The 3D explorer (prototype): the live three.js stage (runtime/scene.ts, loaded after mount) and a panel to pick
 * a tower and a level. Picking on the building or in the panel does the same thing and updates the URL
 * (/nathia/explore/<tower>/<level>), so any view can be shared. The panel is the keyboard and screen-reader way in;
 * the stage turns with arrow keys too. Reduced motion: no automatic turn and no drag inertia.
 */
export function OrbitExplorer({ content, initial }: { content: Explorer; initial: ExplorerSelection }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<ExplorerScene | null>(null);
  const [sel, setSel] = useState(initial);
  const [hover, setHover] = useState<Hit | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const tower = content.towers.find((t) => t.slug === sel.tower) ?? null;
  const bySlug = (slug: string) => content.towers.find((t) => t.slug === slug)!;

  const pick = (next: ExplorerSelection) => {
    setSel(next);
    window.history.replaceState(null, "", explorerPath(content, next));
  };
  // The scene is created once; it reaches the latest pick through this ref.
  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  });

  useEffect(() => {
    let live = true;
    let instance: ExplorerScene | undefined;
    void import("./runtime/scene").then(({ createExplorerScene }) => {
      if (!live || !canvas.current) return;
      instance = createExplorerScene({
        canvas: canvas.current,
        towers: content.towers,
        levelHeight: content.levelHeight,
        onHover: setHover,
        onPick: (hit) => pickRef.current(hit),
        onPlayingChange: setPlaying,
        onReady: () => setReady(true),
      });
      stage.current = instance;
    });
    return () => {
      live = false;
      instance?.destroy();
      stage.current = null;
      setReady(false);
    };
  }, [content]);

  useEffect(() => {
    stage.current?.setHighlight({ tower: sel.tower, level: sel.level }, hover);
  }, [ready, sel.tower, sel.level, hover]);

  const hovered = hover ? `${bySlug(hover.tower).name} · ${levelName(content, bySlug(hover.tower), hover.level)}` : null;
  const levelButtons = (t: ExplorerTower) => Array.from({ length: t.levels }, (_, i) => t.levels - 1 - i);

  return (
    <div className="fixed inset-0 z-[1] flex bg-ink text-paper max-[899px]:flex-col">
      {/* Stage: drag to turn, pinch or scroll to zoom, tap a level, or use the arrow keys once focused. */}
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label={content.hint}
          data-cursor="Drag"
          className={`block size-full select-none ${focusRing}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              stage.current?.turn(e.key === "ArrowLeft" ? -10 : 10);
            }
          }}
        />
        {!ready && (
          <p role="status" className={`absolute inset-0 grid place-items-center ${label} text-on-ink/70`}>
            {content.loading}
          </p>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 px-[clamp(20px,4.2vw,72px)] py-6">
          <Link href="/nathia" className={`pointer-events-auto ${label} text-on-ink/80 hover:text-paper ${focusRing}`}>
            ← {content.back}
          </Link>
        </div>
        <p aria-live="polite" className={`pointer-events-none absolute inset-x-0 bottom-6 text-center ${label} text-on-ink/80`}>
          {hovered ?? content.hint}
        </p>
      </div>

      {/* Panel: tower, level, readout. Right on desktop, under the stage on mobile. */}
      <aside className="flex w-[360px] shrink-0 flex-col gap-7 overflow-y-auto border-l border-on-ink/15 px-7 py-8 max-[899px]:max-h-[44vh] max-[899px]:w-full max-[899px]:border-t max-[899px]:border-l-0 max-[899px]:px-5 max-[899px]:py-5">
        <h1 className="font-display text-[2rem] leading-none font-semibold">{content.title}</h1>

        <div className="flex gap-2" role="group" aria-label="Tower">
          {content.towers.map((t) => (
            <button
              key={t.slug}
              type="button"
              aria-pressed={sel.tower === t.slug}
              onClick={() => pick({ tower: t.slug, level: null })}
              className={`flex-1 rounded-full border px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                sel.tower === t.slug ? "border-accent bg-accent text-paper" : "border-on-ink/30 hover:border-paper"
              } ${focusRing}`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {tower ? (
          <div role="group" aria-label={`${tower.name} levels`} className="grid grid-cols-4 gap-1.5">
            {levelButtons(tower).map((i) => (
              <button
                key={i}
                type="button"
                aria-pressed={sel.level === i}
                aria-label={levelName(content, tower, i)}
                onClick={() => pick({ tower: tower.slug, level: i })}
                onPointerEnter={() => setHover({ tower: tower.slug, level: i })}
                onPointerLeave={() => setHover(null)}
                className={`rounded-[3px] border py-2 text-[0.8rem] tabular-nums transition-colors ${
                  i === tower.levels - 1 ? "col-span-4" : ""
                } ${sel.level === i ? "border-accent bg-accent text-paper" : "border-on-ink/20 hover:border-paper"} ${focusRing}`}
              >
                {i === tower.levels - 1 ? content.penthouse : i + 1}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-on-ink/70">{content.pickLevel}</p>
        )}

        {tower && sel.level !== null && (
          <div className="grid gap-3 border-t border-on-ink/15 pt-6">
            <p className={`${label} text-accent-on-ink`}>{tower.name}</p>
            <p className="font-display text-[1.6rem] leading-none">{levelName(content, tower, sel.level)}</p>
            <button type="button" disabled className="mt-2 rounded-full border border-on-ink/30 py-3 text-[0.72rem] uppercase tracking-[0.18em] opacity-60">
              {content.showHomes}
            </button>
            <p className="text-[0.8rem] text-on-ink/55">{content.showHomesSoon}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => stage.current?.play(!playing)}
          className={`mt-auto self-start ${label} text-on-ink/70 underline-offset-4 hover:text-paper hover:underline ${focusRing}`}
        >
          {playing ? content.pause : content.play}
        </button>
      </aside>
    </div>
  );
}
