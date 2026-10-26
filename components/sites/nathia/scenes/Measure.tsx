import { Odometer, PinnedSection } from "@/components/motion";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { gx } from "../tokens";
import { MeasureMotion } from "./MeasureMotion";
import { NathiaImg } from "../NathiaImg";

/**
 * Scene 04, the Measure [section.mz]: pinned (3.4 viewports, 2.8 on mobile). Four numbers in turn, each a
 * giant odometer filled with its photo, counting up over a blurred, veiled copy of that photo, with an index,
 * label and note; ticks along the bottom track the four. Server markup shows every number at its final value
 * (the runtime rolls them from 0). Reduced motion: no pin; the four numbers stacked, at their final values.
 */
export function Measure({ scene, chapter }: SceneProps) {
  if (scene.type !== "numbers") return null;
  const layout = sceneLayout.numbers;
  const { className, tone } = surfaceStyle.paper;
  const total = String(scene.numbers.length).padStart(2, "0");

  return (
    <PinnedSection
      id={scene.id}
      length={layout.pin!.desktop}
      mobileLength={layout.pin!.mobile}
     
      className={`${className} motion-reduce:h-auto motion-reduce:min-h-svh motion-reduce:py-[16vh]`}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
    >
      {/* [.mz-bgs]: one photo per number (blur ramps in at the start), under a radial veil. */}
      <div aria-hidden className="absolute inset-0">
        {scene.numbers.map((n, i) => (
          <div key={n.img + i} data-mz-bg className="absolute inset-0 will-change-[transform,opacity]" style={{ opacity: i === 0 ? 1 : 0 }}>
            <NathiaImg
              name={n.img}
              alt=""
              sizes="(max-width: 899px) 60vw, 100vw"
              className="object-cover [filter:blur(var(--mz-blur,0px))_saturate(.9)]"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgb(12_15_13/.72),rgb(12_15_13/.9))]" />
      </div>

      {chapter && (
        <SceneLabel no={chapter.no} tone="dark" className={`absolute top-[calc(84px+3vh)] left-0 text-ink max-[899px]:top-[calc(68px+3vh)] motion-reduce:static motion-reduce:mb-[8vh] ${gx}`}>
          {scene.label}
        </SceneLabel>
      )}

      {/* [.mz-nums]: stacked in one place; one shows at a time. */}
      <div className="absolute inset-0 motion-reduce:relative motion-reduce:grid motion-reduce:gap-[14vh]">
        {scene.numbers.map((n, i) => (
          <div
            key={n.img + i}
            data-mz-num
            data-value={n.value}
            // Only the first shows until the runtime plays them in turn; all four with reduced motion (stacked).
            className={`absolute inset-0 flex flex-col items-center justify-center will-change-[transform,opacity,filter] motion-reduce:static motion-reduce:opacity-100 ${i === 0 ? "" : "opacity-0"}`}
          >
            <div className="flex items-start gap-[0.8vw]">
              <Odometer
                value={n.value}
                digits={String(n.value).length}
                dimClassName="opacity-16"
                // [.mz-odo]: 700, tracking -.05em; columns .6em; digits filled with the photo (background-clip:
                // text over a bone base, brightened) once it loads.
                className="font-display text-[clamp(8rem,31vw,34rem)] font-bold tracking-[-0.05em] max-[899px]:text-[36vw] [&_[data-odometer-col]]:w-[0.6em] [&_[data-odometer-col]]:text-center [&_[data-odometer-sep]]:inline-block [&_[data-odometer-sep]]:w-[0.24em] [&_[data-odometer-strip]]:bg-ink [&_[data-odometer-sep]]:bg-ink [&_[data-odometer-strip]]:bg-clip-text [&_[data-odometer-sep]]:bg-clip-text [&_[data-odometer-strip]]:bg-no-repeat [&_[data-odometer-sep]]:bg-no-repeat [&_[data-odometer-strip]]:text-transparent [&_[data-odometer-sep]]:text-transparent [&_[data-odometer-strip]]:[filter:brightness(1.18)_saturate(1.08)] [&_[data-odometer-sep]]:[filter:brightness(1.18)_saturate(1.08)]"
              />
              {n.unit && (
                <span className="mt-[4.5vw] font-mono text-[clamp(0.8rem,1.1vw,1rem)] tracking-[0.32em] text-accent-soft max-[899px]:mt-[6vw]">{n.unit}</span>
              )}
            </div>
            {/* [.mz-cap] */}
            <div className="mt-[2.6vh] grid justify-items-center gap-3 text-center text-ink [text-shadow:0_2px_24px_rgb(12_15_13/.55)]">
              <span data-mz-cap className="font-mono text-[0.78rem] font-medium tracking-[0.22em] text-accent-soft">
                {String(i + 1).padStart(2, "0")} / {total}
              </span>
              <p data-mz-cap className="text-[clamp(0.82rem,0.95vw,1rem)] font-semibold uppercase tracking-[0.28em]">
                {n.label}
              </p>
              <p data-mz-cap className="max-w-[20em] font-display text-[clamp(1.6rem,2.4vw,2.7rem)] leading-[1.15] font-semibold tracking-[-0.005em] max-[899px]:px-[clamp(20px,4.2vw,72px)] max-[899px]:text-[1.55rem]">
                {n.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* [.mz-ticks]: one 44px track per number, filling as its step plays. */}
      <div aria-hidden className="absolute bottom-[5vh] left-1/2 flex -translate-x-1/2 gap-2.5 motion-reduce:hidden">
        {scene.numbers.map((n, i) => (
          <span key={n.img + i} className="relative h-px w-11 overflow-hidden bg-ink/22">
            <i data-mz-tick className="absolute inset-0 origin-left bg-accent-soft" style={{ transform: "scaleX(0)" }} />
          </span>
        ))}
      </div>

      <MeasureMotion sceneId={scene.id} numbers={scene.numbers.map((n) => ({ img: n.img, focus: n.focus, zoom: n.zoom }))} />
    </PinnedSection>
  );
}
