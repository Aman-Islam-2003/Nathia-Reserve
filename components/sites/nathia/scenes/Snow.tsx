import { Odometer, PinnedSection } from "@/components/motion";
import { NathiaImg } from "../NathiaImg";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { displayEm, iceText } from "../tokens";
import { SnowMotion } from "./SnowMotion";

/** A line inside its mask [.ln / .ln-i]: room below for descenders, pulled back so spacing is unchanged. */
const mask = "-mb-[0.1em] block overflow-clip pb-[0.1em]";

/**
 * Scene 10, four seasons high [section.sn]: pinned (2.4 viewports, 1.8 on phones) over the snow film (a still,
 * then the video, which plays once while pinned and eases to a stop). Snow falls over it (WebGL, SnowMotion),
 * the heading rises, the copy and the count fade up, and the count rolls to the days a year. Reduced motion:
 * no pin, the still, everything shown, the count at its value.
 */
export function Snow({ scene, chapter }: SceneProps) {
  if (scene.type !== "snow") return null;
  const layout = sceneLayout.snow;
  const { className, tone } = surfaceStyle[layout.surface];
  const file = `/nathia/video/${scene.video}`;

  return (
    <PinnedSection
      id={scene.id}
      length={layout.pin!.desktop}
      mobileLength={layout.pin!.mobile}
      // Reduced motion: no pin, but still a full-screen stage, as live.
      className={`${className} motion-reduce:h-svh`}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
    >
      {/* [.sn-media]: the still, and the video over it (its file set by the runtime while pinned). */}
      <div data-sn-media className="absolute inset-0 will-change-transform">
        <NathiaImg file={`${file}.webp`} candidates={`${file}-sm.webp 960w, ${file}.webp 1600w`} alt={scene.alt} sizes="100vw" className="object-cover" />
        <video data-lg={`${file}.mp4`} data-sm={`${file}-sm.mp4`} muted playsInline preload="none" aria-hidden className="absolute inset-0 size-full object-cover" />
      </div>
      {/* [.sn-canvas]: the falling snow. */}
      <canvas data-sn-canvas aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      {/* [.sn-shade] */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#080b0dc7_0%,#080b0d33_50%,#080b0d00_75%),linear-gradient(#080b0d00_60%,#080b0d99)]" />
      {/* [.sn-copy] */}
      <div className="absolute inset-x-0 top-[calc(84px+6vh)] max-w-[54rem] px-[clamp(20px,4.2vw,72px)] text-ink max-[899px]:top-[calc(68px+6vh)]">
        <SceneLabel no={chapter?.no ?? ""} tone="dark">
          {scene.label}
        </SceneLabel>
        <h2 className="mt-[4vh] font-display text-[clamp(3rem,7.4vw,8.6rem)] leading-[0.92] font-semibold tracking-[-0.015em] lining-nums">
          {scene.heading.map((line, i) => (
            <span key={i} className={mask}>
              {i > 0 && " "}
              <span data-sn-line className="block">
                {typeof line === "string" ? line : line.map((part, k) => (typeof part === "string" ? part : <em key={k} className={`${displayEm} ${iceText}`}>{part.em}</em>))}
              </span>
            </span>
          ))}
        </h2>
        {scene.body && (
          <p data-sn-body className="mt-[4vh] max-w-[28em] text-[clamp(1rem,1.06vw,1.13rem)] leading-[1.7] text-ink/84">
            {scene.body}
          </p>
        )}
      </div>
      {/* [.sn-count] */}
      <div data-sn-count className="absolute right-[clamp(20px,4.2vw,72px)] bottom-[8vh] grid justify-items-end gap-1.5 text-right text-ink max-[899px]:right-auto max-[899px]:bottom-[5vh] max-[899px]:left-[clamp(20px,4.2vw,72px)] max-[899px]:justify-items-start max-[899px]:text-left">
        <span className={`font-mono text-[0.66rem] uppercase tracking-[0.24em] ${iceText}`}>{scene.kicker}</span>
        <Odometer
          value={scene.count}
          digits={String(scene.count).length}
          separator=""
          dimClassName="opacity-14"
          // [.sn-odo]: tracking -.04em; columns .54em, centred [.odo-col].
          className="font-display text-[clamp(5rem,13vw,15rem)] font-semibold tracking-[-0.04em] max-[899px]:text-[30vw] [&_[data-odometer-col]]:w-[0.54em] [&_[data-odometer-col]]:text-center"
        />
        <span className={`font-mono text-[0.66rem] uppercase tracking-[0.24em] ${iceText}`}>{scene.countLabel}</span>
      </div>
      <SnowMotion sceneId={scene.id} count={scene.count} />
    </PinnedSection>
  );
}
