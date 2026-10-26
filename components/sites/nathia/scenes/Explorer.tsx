import { Magnetic, PinnedSection } from "@/components/motion";
import { ExplorerOpen } from "../ExplorerOpen";
import { renderLine } from "../line";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { focusRing, gx, magnetic, pillHover } from "../tokens";
import { ExplorerMotion } from "./ExplorerMotion";
import { NathiaImg } from "../NathiaImg";

/**
 * Scene 03, the explorer portal [section.xp]: pinned (2.2 viewports, 1.6 on mobile). The heading rises, a window
 * onto the explorer poster opens to full screen, the copy leaves, and an Enter button pops in; the button and
 * the window open the 3D explorer overlay (ExplorerDialog). Part of chapter 02: it has no chapter of its own.
 * Reduced motion (as live): no pin or timeline; the full poster with the copy and the Enter button over it. The
 * copy then sits on the photo, so it gets a bone scrim (CLAUDE.md §9; live has none).
 */
export function Explorer({ scene, site }: SceneProps) {
  if (scene.type !== "explorer") return null;
  const layout = sceneLayout.explorer;
  const { className, tone } = surfaceStyle.ink;

  return (
    <PinnedSection
      id={scene.id}
      length={layout.pin!.desktop}
      mobileLength={layout.pin!.mobile}
     
      className={className}
      data-scene={scene.type}
      data-tone={tone}
      aria-label={scene.label}
      data-xp
    >
      {/* [.xp-window]: the poster, clipped to a rounded frame at first, opening to full screen. */}
      <ExplorerOpen variant="surface" data-xp-window data-cursor="Explore" className="absolute inset-0 cursor-pointer overflow-hidden">
        <NathiaImg
          file={scene.poster}
          // [.xp-window img]: the small poster as an 800w candidate, the full one 1600w.
          candidates={`${scene.poster.replace(/\.webp$/, "-sm.webp")} 800w, ${scene.poster} 1600w`} alt={scene.posterAlt} sizes="100vw" className="object-cover will-change-transform" />
        {/* [.xp-veil]: darkens the edges once full screen, so the Enter button reads. */}
        <div data-xp-veil className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_60%,rgb(12_15_13/.05),rgb(12_15_13/.55))] opacity-0" />
      </ExplorerOpen>

      {/* [.xp-copy]: centred under the header (at the bottom on mobile). */}
      <div
        data-xp-copy
        className={`pointer-events-none absolute inset-x-0 top-[calc(84px+1vh)] z-[2] grid justify-items-center text-center max-[899px]:top-auto max-[899px]:bottom-[6vh] motion-reduce:mx-[clamp(20px,4.2vw,72px)] motion-reduce:rounded-[3px] motion-reduce:bg-ink/80 motion-reduce:py-[3vh] ${gx}`}
      >
        <SceneLabel no={scene.marker} tone="light">
          {scene.label}
        </SceneLabel>
        <h2 className="mt-[2vh] font-display text-[clamp(2.2rem,3.9vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.015em] lining-nums max-[899px]:text-[2.3rem]">
          {scene.heading.map((line, i) => (
            // [.ln]: a mask with room for descenders.
            <span key={i} className="-mb-[0.1em] block overflow-clip pb-[0.1em]">
              {i > 0 && " "}
              <span data-xp-line className="block">
                {renderLine(line, "font-medium tracking-[-0.01em] text-accent-on-ink")}
              </span>
            </span>
          ))}
        </h2>
        {scene.body && <p data-xp-body className="mt-[2vh] max-w-[30em] text-[clamp(1rem,1.06vw,1.13rem)] leading-[1.7] text-on-ink/78">{scene.body}</p>}
      </div>

      {/* [.xp-enter]: the Enter button and the new-tab link, low in the frame (34vh up on mobile). */}
      <div data-xp-enter className="absolute bottom-[12vh] left-1/2 z-[3] grid -translate-x-1/2 justify-items-center gap-[18px] text-ink max-[899px]:bottom-[34vh]">
        <Magnetic {...magnetic}>
        <ExplorerOpen
          className={`inline-flex h-[60px] items-center gap-[0.9em] rounded-full border border-accent bg-accent px-[34px] text-[0.78rem] font-medium uppercase tracking-[0.18em] text-paper shadow-[0_20px_60px_-20px_rgb(0_0_0/0.6)] ${pillHover} ${focusRing}`}
        >
          {scene.cta}
          <svg aria-hidden viewBox="0 0 18 10" className="h-2.5 w-[18px]" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M0 5h17M12.5 0.5 17 5l-4.5 4.5" />
          </svg>
        </ExplorerOpen>
        </Magnetic>
        <a
          href={site.project.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative inline-flex items-center pb-1.5 text-[0.66rem] font-medium uppercase tracking-[0.18em] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:bg-current after:transition-transform after:duration-700 after:ease-[var(--theme-ease)] hover:after:scale-x-0 ${focusRing}`}
        >
          {scene.newTab}
        </a>
      </div>

      <ExplorerMotion sceneId={scene.id} />
    </PinnedSection>
  );
}
