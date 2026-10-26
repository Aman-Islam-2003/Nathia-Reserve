import Link from "next/link";
import { HorizontalScroll, Marquee, RiseLines } from "@/components/motion";
import { Arrow } from "../Arrow";
import { ExplorerOpen } from "../ExplorerOpen";
import { renderLines } from "../line";
import { NathiaImg } from "../NathiaImg";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { displayEm, focusRing, gx, pill, pillHoverOnLight, residencesTiming as t, textLink } from "../tokens";

/** A captioned interior [.rs-tile]: the film strip (desktop) and the rows (mobile). */
function Tile({ img, label, sizes, className }: { img: string; label: string; sizes: string; className: string }) {
  return (
    <figure className={`relative flex-none overflow-hidden rounded-[3px] after:absolute after:inset-0 after:bg-linear-to-b after:from-paper/0 after:from-50% after:to-paper/60 after:content-[''] ${className}`}>
      <NathiaImg name={img} alt="" sizes={sizes} className="object-cover" />
      <figcaption className="absolute bottom-2.5 left-3 z-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">{label}</figcaption>
    </figure>
  );
}

/**
 * Scene 07, the residences [section.rs]: pinned while the track of panels slides sideways (HorizontalScroll,
 * settings in residencesTiming): the intro, one panel per residence type (photo, plate, outline number, name,
 * line, specs, note, the floor-plate request and the 3D explorer), and the link to the full mix; along the
 * bottom a strip of interiors runs the other way. Below 900px nothing pins: the panels stack, and two rows
 * of interiors loop in opposite directions (approved: no button, a tap pauses them, CLAUDE.md §12). Reduced
 * motion: the panels stack, static.
 */
export function Residences({ scene, chapter, site }: SceneProps) {
  if (scene.type !== "residences") return null;
  const { className, tone } = surfaceStyle[sceneLayout.residences.surface];
  const count = String(site.residences.length).padStart(2, "0");
  const film = scene.film;

  return (
    <HorizontalScroll
      id={scene.id}
      overflow={t.overflow}
      distance={t.distance}
      scrub={t.scrub}
      effects={[...t.effects]}
      stackedEffects={[...t.stackedEffects]}
      // [.rs-stage] / [.rs-track]: the track is 73% of the stage; stacked below 900px.
      className={className}
      trackClassName="h-[73%] max-[899px]:h-auto motion-reduce:h-auto"
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      after={
        // [.rs-film]: interiors along the bottom, moving the other way (desktop only).
        <div aria-label={scene.filmLabel} className="absolute inset-x-0 bottom-[3vh] h-[21%] overflow-hidden max-[899px]:hidden motion-reduce:relative motion-reduce:bottom-auto motion-reduce:h-[21svh]">
          <div data-hs-counter className={`flex h-full w-max gap-[1vw] will-change-transform ${gx}`}>
            {[...film].reverse().map((f, i) => (
              <Tile key={`${f.img}-${i}`} img={f.img} label={f.label} sizes="(min-width: 900px) 20vw, 60vw" className="h-full w-[19vw]" />
            ))}
          </div>
        </div>
      }
    >
      {/* [.rs-intro] */}
      <div
        data-hs-panel
        className={`relative h-full w-[52vw] flex-none pt-[calc(84px+4vh)] pr-[4vw] pl-[clamp(20px,4.2vw,72px)] max-[899px]:h-auto max-[899px]:w-auto max-[899px]:pt-[14vh] max-[899px]:pb-[6vh] max-[899px]:px-[clamp(20px,4.2vw,72px)] motion-reduce:h-auto motion-reduce:pb-[6vh]`}
      >
        <SceneLabel no={chapter?.no ?? ""} tone={tone}>
          {scene.label}
        </SceneLabel>
        <RiseLines
          lines={renderLines(scene.heading, `${displayEm} text-accent-on-ink`)}
          trigger="section"
          at={t.head.at}
          stagger={t.head.stagger}
          duration={t.head.duration}
          className="mt-[4vh] font-display text-[clamp(3rem,7.4vw,8.6rem)] leading-[0.92] font-semibold tracking-[-0.015em] lining-nums"
        />
        {scene.body && <p className="mt-[5vh] max-w-[26em] text-[clamp(1rem,1.06vw,1.13rem)] leading-[1.7] text-on-ink/82">{scene.body}</p>}
        <p className="absolute bottom-[2vh] left-[clamp(20px,4.2vw,72px)] inline-flex items-center gap-3.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent-on-ink max-[899px]:static max-[899px]:mt-[5vh] motion-reduce:static motion-reduce:mt-[5vh]">
          {scene.hint} <Arrow className="h-2.5 w-[22px]" />
        </p>
      </div>

      {/* [.rs-marquee]: below 900px, two rows of interiors looping in opposite directions (decorative). */}
      <div aria-hidden data-marquee-group className="hidden gap-2.5 overflow-hidden pt-[2vh] pb-[6vh] max-[899px]:grid">
        {[film, [...film].reverse()].map((row, r) => (
          <Marquee key={r} loop={t.rowLoop} direction={r ? "right" : "left"} control="tap" label={scene.filmLabel}>
            {row.map((f) => (
              <Tile key={f.img} img={f.img} label={f.label} sizes="50vw" className="mr-2.5 h-[22vh] w-[56vw]" />
            ))}
          </Marquee>
        ))}
      </div>

      {site.residences.map((r, i) => (
        // [.rs-type]
        <article
          key={r.id}
          data-hs-panel
          className="relative grid h-full w-[92vw] flex-none grid-cols-[44vw_1fr] items-end gap-[4vw] pt-[calc(84px+1vh)] pr-[5vw] pb-[1vh] pl-[2vw] max-[899px]:block max-[899px]:h-auto max-[899px]:w-auto max-[899px]:px-[clamp(20px,4.2vw,72px)] max-[899px]:pt-[4vh] max-[899px]:pb-[8vh] motion-reduce:h-[73svh]"
        >
          {/* [.rs-media] */}
          <div data-rs-media data-cursor="View" className="relative h-[54vh] overflow-hidden rounded-[3px] will-change-[clip-path] max-[899px]:h-[56vh]">
            <NathiaImg name={r.hero} alt={r.heroAlt} sizes="(min-width: 900px) 46vw, 92vw" className="object-cover will-change-transform" />
            {r.soldOut && (
              <span className="absolute top-4 right-4 z-2 rounded-full bg-ink/92 px-3.5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-on-ink">
                {scene.soldOut}
              </span>
            )}
          </div>
          {/* [.rs-plate] */}
          <figure
            data-rs-plate
            className="absolute bottom-[3vh] left-[35vw] z-2 aspect-[4/5] w-[12vw] overflow-hidden border-[6px] border-ink shadow-[0_30px_60px_-30px_rgb(12_15_13/.45)] max-[899px]:top-[44vh] max-[899px]:right-[calc(clamp(20px,4.2vw,72px)+4vw)] max-[899px]:bottom-auto max-[899px]:left-auto max-[899px]:w-[34vw] max-[899px]:border-4"
          >
            <NathiaImg name={r.plate} alt={r.plateAlt} sizes="(min-width: 900px) 18vw, 50vw" className="object-cover" />
          </figure>
          {/* [.rs-num]: the outline number. */}
          <span
            data-rs-num
            aria-hidden
            className="pointer-events-none absolute top-[calc(84px-3vh)] right-[3vw] font-display text-[clamp(7rem,17vw,20rem)] leading-[0.8] font-semibold tracking-[-0.015em] text-transparent lining-nums [-webkit-text-stroke:1px_var(--theme-line-on-light)] max-[899px]:hidden"
          >
            0{i + 1}
          </span>
          {/* [.rs-text] */}
          <div className="relative z-1 max-w-[34rem] max-[899px]:mt-[5vh]">
            <p data-rs-fade className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent-on-ink">
              0{i + 1} / {count}
              <span> · {r.collection}</span>
            </p>
            <h3 data-rs-fade className="mt-[1.4vh] font-display text-[clamp(2.8rem,5.4vw,6.4rem)] leading-[0.92] font-semibold tracking-[-0.015em] lining-nums">
              {r.name}
            </h3>
            <p data-rs-fade className="mt-[2.4vh] font-display text-lg leading-[1.3] italic text-on-ink">
              {r.line}
            </p>
            <dl data-rs-fade className="mt-[2.6vh] grid grid-cols-[auto_auto_1fr] gap-[2.8vw] border-y border-line-on-light py-[1.8vh] max-[899px]:grid-cols-[auto_1fr] max-[899px]:gap-[8vw]">
              {[
                [scene.specs.units, String(r.units)],
                [scene.specs.area, r.area],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-on-ink/62">{k}</dt>
                  <dd className="mt-2 font-display text-[clamp(1.8rem,2.6vw,2.8rem)] leading-none font-semibold tracking-[-0.015em] lining-nums max-[899px]:text-[1.55rem]">{v}</dd>
                </div>
              ))}
              {/* [.rs-spec-price]: its own row below 900px. */}
              <div className="max-[899px]:col-span-full max-[899px]:border-t max-[899px]:border-line-on-light max-[899px]:pt-3">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-on-ink/62">{r.soldOut ? scene.specs.availability : scene.specs.price}</dt>
                <dd className="mt-2 font-display text-[clamp(1.8rem,2.6vw,2.8rem)] leading-none font-semibold tracking-[-0.015em] lining-nums max-[899px]:text-[1.55rem]">
                  {r.soldOut ? scene.soldOut : r.priceCrore}
                </dd>
              </div>
            </dl>
            <p data-rs-fade className="mt-[1.8vh] max-w-[34em] text-[clamp(1rem,1.06vw,1.13rem)] leading-[1.7] text-on-ink/78">
              {r.note}
            </p>
            <div data-rs-fade className="mt-[2.6vh] flex flex-wrap items-center gap-[26px]">
              {!r.soldOut && (
                <Link
                  href={`${scene.interest.href}?unit=${encodeURIComponent(r.id)}`}
                  data-cursor="hide"
                  // Four of these on the page: the type makes each name unique (WCAG 2.5.3, CLAUDE.md §6).
                  aria-label={`${scene.interest.label}: ${r.name}`}
                  className={`${pill} ${pillHoverOnLight} border-on-ink bg-on-ink text-ink ${focusRing}`}
                >
                  <span>{scene.interest.label}</span>
                  <Arrow className="h-2.5 w-[18px]" />
                </Link>
              )}
              <ExplorerOpen path={scene.explore.path} data-cursor="hide" className={`${textLink} ${focusRing}`}>
                {scene.explore.label}
              </ExplorerOpen>
            </div>
          </div>
        </article>
      ))}

      {/* [.rs-outro] */}
      <div data-hs-panel className={`grid h-full w-[44vw] flex-none place-items-center max-[899px]:h-auto max-[899px]:w-auto max-[899px]:place-items-start max-[899px]:pt-[4vh] max-[899px]:pb-[14vh] max-[899px]:px-[clamp(20px,4.2vw,72px)] motion-reduce:py-[8vh]`}>
        <Link
          href={scene.cta.href}
          data-cursor="View"
          className={`inline-flex items-center gap-[0.4em] border-b border-current pb-[0.1em] font-display text-[clamp(2.2rem,4.6vw,5.4rem)] leading-[0.92] font-semibold tracking-[-0.015em] italic lining-nums ${focusRing}`}
        >
          {scene.cta.label}
          <Arrow className="h-[0.35em] w-[0.6em]" />
        </Link>
      </div>
    </HorizontalScroll>
  );
}
