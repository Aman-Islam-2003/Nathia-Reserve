import { PinnedSection } from "@/components/motion";
import { NathiaImg } from "../NathiaImg";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { display, focusRing, gx, MOBILE_QUERY } from "../tokens";
import { DayMotion } from "./DayMotion";

/** A line inside its mask [.ln / .ln-i]: room below for descenders, pulled back so spacing is unchanged. */
const mask = "-mb-[0.1em] block overflow-clip pb-[0.1em]";

/**
 * Scene 06, one day at the Reserve [section.dy]: pinned (3.2 viewports, 2.8 on mobile). Four times of day; a
 * WebGL wipe carries the photo from one to the next (DayMotion), a large clock counts the minutes between
 * them, each moment's line rises in, and the four segment buttons fill along the bottom (a click scrolls to
 * that moment). Weak devices crossfade the photos. Reduced motion (as live): no pin; the first moment, and
 * the segment buttons switch between moments (a fade).
 */
export function Day({ scene, chapter }: SceneProps) {
  if (scene.type !== "day") return null;
  const layout = sceneLayout.day;
  const { className, tone } = surfaceStyle[layout.surface];
  const [hours, minutes] = scene.moments[0].time.split(":");

  return (
    <PinnedSection
      id={scene.id}
      length={layout.pin!.desktop}
      mobileLength={layout.pin!.mobile}
      // Reduced motion: no pin, but still a full-screen stage, as live.
      className={`${className} leading-[1.6] motion-reduce:h-svh`}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
    >
      {/* [.dy-stills]: the first photo shows until the wipe is ready (and on weak devices); the others get their
          files only for the crossfade (weak devices, reduced motion). */}
      <div aria-hidden data-dy-stills className="absolute inset-0">
        {scene.moments.map((m, i) =>
          i === 0 ? (
            <picture key={m.img}>
              <source media={MOBILE_QUERY} srcSet={`/nathia/img/${m.img}-m.webp`} />
              {/* As live [.dy-still]: the -lg file alone on wider screens (no srcset), the -m file on phones. */}
              <NathiaImg file={`/nathia/img/${m.img}-lg.webp`} alt="" sizes="100vw" className="object-cover object-[50%_40%]" />
            </picture>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- no file until the runtime needs it (crossfade only)
            <img key={m.img} data-img={m.img} alt="" decoding="async" className="absolute inset-0 size-full object-cover object-[50%_40%]" style={{ opacity: 0 }} />
          ),
        )}
      </div>
      {/* [.dy-canvas]: the wipe; fades in (.8s) once the four photos are on the GPU. */}
      <canvas
        aria-hidden
        data-dy-canvas
        data-print="hide"
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-800 ease-[var(--theme-ease-in-out)] data-live:opacity-100 motion-reduce:hidden"
      />
      {/* [.dy-shade]: darker at the top for the label and clock, and at the bottom for the line and bar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(12_15_13/.55)_0%,rgb(12_15_13/0)_26%),linear-gradient(rgb(12_15_13/0)_50%,rgb(12_15_13/.55)_78%,rgb(12_15_13/.9)_100%)]"
      />

      {/* [.dy-head] */}
      {chapter && (
        <div data-dy-head className="absolute top-[calc(84px+3vh)] left-[clamp(20px,4.2vw,72px)] flex text-ink max-[899px]:top-[calc(68px+3vh)]">
          <SceneLabel no={chapter.no} tone="dark">
            {scene.label}
          </SceneLabel>
        </div>
      )}

      {/* [.dy-clock]: decorative; the moments are in the bar and the lines. */}
      <div
        aria-hidden
        className="absolute top-[calc(84px+1vh)] right-[clamp(20px,4.2vw,72px)] grid justify-items-end gap-1.5 text-ink [text-shadow:0_2px_40px_rgb(12_15_13/.45)] max-[899px]:top-[calc(68px+6vh)]"
      >
        {/* [.dy-glyph]: a warm sun, a cool moon after 19:24 (data-moon). */}
        <span
          data-dy-glyph
          className="size-[18px] rounded-full bg-[#ffd9a3] shadow-[0_0_0_6px_rgb(255_217_163/.16),0_0_28px_6px_rgb(255_200_130/.45)] transition-[background-color,box-shadow] duration-800 data-moon:bg-[#eef1f5] data-moon:shadow-[inset_-5px_-2px_0_0_#c9d2dc,0_0_22px_4px_rgb(200_215_235/.35)]"
        />
        {/* [.dy-clock-time]: the display face without the display token, whose leading and tracking would win over these. */}
        <span className="flex items-baseline font-display text-[clamp(4.4rem,10vw,11.5rem)] leading-[0.9] font-semibold tracking-[-0.02em] tabular-nums lining-nums max-[899px]:text-[19vw]">
          <span data-dy-hours>{hours}</span>
          <span className="mx-[0.03em] opacity-55 [translate:0_-0.06em]">:</span>
          <span data-dy-minutes>{minutes}</span>
        </span>
        <span className="font-mono text-[0.68rem] tracking-[0.26em] text-accent-soft uppercase">{scene.zone}</span>
      </div>

      {/* [.dy-bottom] */}
      <div className={`absolute inset-x-0 bottom-[5vh] max-[899px]:bottom-[11vh] ${gx}`}>
        {/* [.dy-texts]: the four lines in one cell; the current one shows. */}
        <div className="mb-[4.4vh] grid">
          {scene.moments.map((m, i) => (
            <div key={m.time} data-dy-text className="text-ink [grid-area:1/1]" style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}>
              <p className={`${display} max-w-[16em] text-[clamp(2.3rem,4.3vw,5rem)] leading-none [text-shadow:0_2px_30px_rgb(12_15_13/.4)] max-[899px]:text-[2.3rem]`}>
                <span className={mask}>
                  <span data-dy-line className="block">
                    {m.line}
                  </span>
                </span>
              </p>
            </div>
          ))}
        </div>
        {/* [.dy-bar]: the four moments; the current one lit, each filling as the day passes through it. */}
        <div role="group" aria-label={scene.barLabel} className="grid grid-cols-4 gap-3.5 max-[899px]:gap-2">
          {scene.moments.map((m, i) => (
            <button
              key={m.time}
              type="button"
              data-dy-seg={i}
              aria-pressed={i === 0}
              className={`group grid gap-2.5 text-left text-ink opacity-55 transition-opacity duration-500 ease-[var(--theme-ease-in-out)] hover:opacity-100 aria-pressed:opacity-100 ${focusRing}`}
            >
              <span className="relative h-0.5 overflow-hidden rounded-[2px] bg-ink/25">
                <i data-dy-fill className="absolute inset-0 origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
              </span>
              <span className="font-mono text-[0.74rem] tracking-[0.14em] text-accent-soft max-[899px]:text-[0.64rem]">{m.time}</span>
              <span className="text-[0.8rem] font-semibold tracking-[0.2em] uppercase max-[899px]:text-[0.56rem] max-[899px]:tracking-[0.06em] max-[899px]:whitespace-nowrap">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DayMotion sceneId={scene.id} moments={scene.moments.map((m) => ({ img: m.img, time: m.time }))} />
    </PinnedSection>
  );
}
