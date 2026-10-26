import type { CSSProperties } from "react";
import { PinnedSection } from "@/components/motion";
import { renderLine } from "../line";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { addressTiming as t, body, display, displayEm, gx } from "../tokens";
import { AddressMotion } from "./AddressMotion";
import { NathiaImg } from "../NathiaImg";

/** A heading line inside its mask [.ln / .ln-i]: room below for descenders, pulled back so spacing is unchanged. */
const mask = "-mb-[0.1em] block overflow-clip pb-[0.1em]";
/** Elements the timeline brings in later: hidden at the start (the runtime sets them from here); shown with reduced motion. */
const later = "invisible opacity-0 motion-reduce:visible motion-reduce:opacity-100";
/**
 * Absolutely placed over the stage; in the flow with reduced motion (no pin, everything readable in turn).
 * Relative there, not static, so it still paints above the absolutely placed poster.
 */
const placed = "absolute motion-reduce:relative motion-reduce:inset-auto! motion-reduce:translate-none!";

/**
 * Scene 05, the only address [section.ad]: pinned (4 viewports, 3.4 on mobile) over a 3D terrain map. The
 * intro (label, heading, body) gives way at .07 to the driving-distances panel and the elevation read-out
 * while the road draws from the airport to the Reserve; the rows light as it reaches each place; the closing
 * heading rises at .9. The map (WebGL, AddressMotion) loads four viewports ahead on capable devices, over the
 * poster; weak devices keep the poster. Reduced motion: no pin, no map; the poster behind the intro, the
 * elevation at the Reserve, every row and the closing heading, in turn.
 */
export function Address({ scene, chapter }: SceneProps) {
  if (scene.type !== "address") return null;
  const layout = sceneLayout.address;
  const { className, tone } = surfaceStyle[layout.surface];
  const em = `${displayEm} text-accent-soft`;

  return (
    <PinnedSection
      id={scene.id}
      length={layout.pin!.desktop}
      mobileLength={layout.pin!.mobile}
      // Line height 1.6 as live's body text [body]: the panel rows, labels and pins inherit it.
      className={`${className} leading-[1.6] motion-reduce:flex motion-reduce:h-auto motion-reduce:min-h-svh motion-reduce:flex-col motion-reduce:gap-[8vh] motion-reduce:py-[16vh]`}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
    >
      {/* [.ad-poster]: the map's still, under the canvas (and instead of it on weak devices). A lazy image, not
          a CSS background as live: a background loaded with the page (41 KB) even though the scene is far below. */}
      <div aria-hidden className="absolute inset-0">
        <NathiaImg file="/nathia/map/poster.webp" alt="" sizes="100vw" className="object-cover" />
      </div>
      {/* [.ad-canvas]: fades in over 1.2 s once the map has drawn (data-live). */}
      <canvas
        aria-hidden
        data-ad-canvas
        data-print="hide"
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-[1.2s] ease-[var(--theme-ease-in-out)] data-live:opacity-100 motion-reduce:hidden"
      />
      {/* [.ad-shade]: darkens the left (text) side and the bottom; lifts while the road draws. */}
      <div
        aria-hidden
        data-ad-shade
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(12_15_13/.82)_0%,rgb(12_15_13/.25)_46%,rgb(12_15_13/0)_70%),linear-gradient(rgb(12_15_13/0)_70%,rgb(12_15_13/.6)_100%)]"
        style={{ opacity: t.shade.from }}
      />

      {/* [.ad-pins]: place names over the map, positioned by the runtime each frame. */}
      <div aria-hidden data-print="hide" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {scene.pins.map((pin) =>
          pin.id === "reserve" ? (
            <span
              key={pin.id}
              data-ad-pin={pin.id}
              className="absolute top-0 left-0 flex flex-col items-center gap-1 whitespace-nowrap text-[0.7rem] tracking-[0.18em] text-ink uppercase opacity-0 will-change-[transform,opacity] [text-shadow:0_1px_10px_rgb(0_0_0/.55)] [translate:-50%_calc(-100%-18px)]"
            >
              <b className="font-display text-[1.3rem] font-semibold tracking-[0.01em] normal-case">{pin.name}</b>
              {pin.note && <em className="font-mono text-[0.62rem] tracking-[0.2em] text-accent-soft not-italic">{pin.note}</em>}
            </span>
          ) : (
            <span
              key={pin.id}
              data-ad-pin={pin.id}
              className="group absolute top-0 left-0 flex items-center gap-[9px] whitespace-nowrap text-[0.7rem] tracking-[0.18em] text-ink uppercase opacity-0 will-change-[transform,opacity] [text-shadow:0_1px_10px_rgb(0_0_0/.55)] max-[899px]:text-[0.6rem]"
            >
              <i className="-ml-[3.5px] size-[7px] rounded-full border border-ink transition-[background-color] duration-500 group-data-on:border-accent-soft group-data-on:bg-accent-soft group-data-on:shadow-[0_0_0_5px_rgb(220_200_177/.18)]" />
              <b className="font-medium">{pin.name}</b>
            </span>
          ),
        )}
      </div>

      {/* [.ad-intro] */}
      <div data-ad-intro className={`${placed} inset-x-0 top-[calc(84px+6vh)] max-w-[62rem] text-ink max-[899px]:top-[calc(68px+6vh)] ${gx}`}>
        {chapter && (
          <SceneLabel no={chapter.no} tone="dark">
            {scene.label}
          </SceneLabel>
        )}
        <h2 className={`${display} mt-[3vh] text-[clamp(2.8rem,6.6vw,7.4rem)]`}>
          {scene.heading.map((line, i) => (
            <span key={i} className={mask}>
              {i > 0 && " "}
              <span data-ad-head className="block will-change-transform">
                {renderLine(line, em)}
              </span>
            </span>
          ))}
        </h2>
        {scene.body && <p data-ad-body className={`${body} mt-[4vh] max-w-[30em]! text-ink/86`}>{scene.body}</p>}
      </div>

      {/* [.ad-elev]: the elevation of the road's head (the read-out is decorative; the end value prints). */}
      <div
        aria-hidden
        data-ad-elev
        className={`${placed} ${later} bottom-[9vh] left-[clamp(20px,4.2vw,72px)] grid gap-[6px] font-mono tracking-[0.04em] text-ink max-[899px]:top-[calc(68px+2vh)] max-[899px]:bottom-auto motion-reduce:mx-[clamp(20px,4.2vw,72px)]`}
      >
        <span className="text-[0.62rem] tracking-[0.24em] text-accent-soft uppercase">{scene.elevation.label}</span>
        <span className="font-display text-[clamp(2.6rem,5vw,5rem)] leading-none tracking-[-0.02em]">
          {/* The end value replaces the live one with reduced motion and in print (not stacked: it would widen the slot). */}
          <span data-counter-final className="hidden motion-reduce:inline print:inline">
            {scene.elevation.end}
          </span>
          <span data-counter-live data-ad-elev-num className="motion-reduce:hidden print:hidden">
            {scene.elevation.start}
          </span>{" "}
          {scene.elevation.unit}
        </span>
      </div>

      {/* [.ad-panel]: right, vertically centred; a strip along the bottom on mobile (only the lit rows). Live
          declares only -webkit-backdrop-filter: blurred in Safari, sharp in Chrome; the same here. */}
      <aside
        data-ad-panel
        aria-label={scene.distances.ariaLabel}
        className={`${placed} ${later} top-1/2 right-[clamp(20px,4.2vw,72px)] w-[min(380px,30vw)] border border-line bg-paper/46 px-[26px] pt-[26px] pb-[18px] text-ink [-webkit-backdrop-filter:blur(14px)] [translate:0_-50%] max-[899px]:top-auto max-[899px]:bottom-[3vh] max-[899px]:left-[clamp(20px,4.2vw,72px)] max-[899px]:w-auto max-[899px]:px-4 max-[899px]:pt-[14px] max-[899px]:pb-[6px] max-[899px]:[translate:none] motion-reduce:mx-[clamp(20px,4.2vw,72px)] motion-reduce:w-auto motion-reduce:max-w-[380px]`}
      >
        <SceneLabel no={scene.distances.label.no} tone="dark">
          {scene.distances.label.text}
        </SceneLabel>
        <ol className="mt-[18px]">
          {scene.distances.rows.map((row) => (
            <li
              key={row.id}
              data-ad-row={row.id}
              className="grid grid-cols-[1fr_auto] gap-x-[14px] gap-y-[2px] border-t border-line py-3 opacity-36 transition-opacity duration-600 ease-[var(--theme-ease-in-out)] [grid-template-areas:'name_km'_'name_time'] data-on:opacity-100 max-[899px]:hidden max-[899px]:py-2 max-[899px]:data-on:grid motion-reduce:grid! motion-reduce:opacity-100"
            >
              <span className="self-center font-display text-[1.3rem] font-semibold [grid-area:name]">{row.name}</span>
              <span className="text-right font-mono text-[0.72rem] tracking-[0.04em] text-accent-soft [grid-area:km]">{row.km}</span>
              <span className="text-right font-mono text-[0.66rem] tracking-[0.04em] opacity-70 [grid-area:time]">{row.drive}</span>
            </li>
          ))}
        </ol>
      </aside>

      {/* [.ad-end]: the closing heading and the note (with the data attribution). */}
      <div data-ad-end className={`${placed} pointer-events-none inset-x-0 bottom-[10vh] text-ink ${gx}`}>
        <h2 className={`${display} text-[clamp(3rem,8vw,9rem)]`}>
          {scene.closing.map((line, i) => (
            <span key={i} className={mask}>
              {i > 0 && " "}
              <span
                data-ad-closing
                className="block will-change-transform motion-reduce:transform-none!"
                style={{ transform: `translateY(${t.closing.yPercent}%)` } as CSSProperties}
              >
                {renderLine(line, em)}
              </span>
            </span>
          ))}
        </h2>
        <p data-ad-note className={`${later} mt-[3vh] max-w-[40em] text-[0.74rem] leading-[1.6] text-ink/60`}>
          {scene.note}
        </p>
      </div>

      <AddressMotion sceneId={scene.id} />
    </PinnedSection>
  );
}
