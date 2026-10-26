import Link from "next/link";
import { preload } from "react-dom";
import { ImageSequence, Magnetic, Odometer, PinnedSection } from "@/components/motion";
import type { NathiaScene } from "@/content/nathia/schema";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout } from "../scenes";
import { MOBILE_QUERY, focusRing, gx, label, magnetic, pill, pillHover } from "../tokens";
import { Fragment } from "react";
import { renderLine } from "../line";
import { SceneLabel } from "../SceneLabel";
import { AscentMotion } from "./AscentMotion";
import { ascentPines, pinePath } from "./pines";

type AscentContent = Extract<NathiaScene, { type: "ascent" }>;
type ManifestoContent = Extract<NathiaScene, { type: "manifesto" }>;

/** Gauge ticks every 250 ft from 0 to 8,000; majors (labelled) every 1,000 [.ascent-gauge-scale]. */
const ticks = Array.from({ length: 33 }, (_, i) => i * 250);
const ELEVATION_SCALE = 8000;

const FOREST = { sm: "/nathia/img/ascent-sm.webp", lg: "/nathia/img/ascent-lg.webp" };

/**
 * Scene 01, the Ascent (live section #ascent): a pinned climb through the forest to the Reserve. Layout and
 * every progress point are measured from the live scene (docs/nathia/inventory.md); the timeline lives in
 * runtime/Ascent.tsx. The title is the page's <h1>, in the server HTML; it is revealed by the climb at 0.705
 * (approved exception, CLAUDE.md §12). The LCP element is the forest still, preloaded and visible at first paint.
 * Reduced motion: no pin, the golden-hour still with the title and copy, as live.
 */
export function Ascent({ scene, chapter, scenes, chapters }: SceneProps) {
  const c = scene as AscentContent;
  const manifesto = scenes.find((s): s is ManifestoContent => s.type === "manifesto");
  const manifestoChapter = chapters.find((c) => c.id === "manifesto")?.no;
  const pin = sceneLayout.ascent.pin!;
  // LCP image: preloaded with the right size for the screen (React hoists this into <head>).
  preload(FOREST.lg, { as: "image", imageSrcSet: `${FOREST.sm} 960w, ${FOREST.lg} 1500w`, imageSizes: "100vw", fetchPriority: "high" });

  return (
    <PinnedSection
      id={c.id}
      length={pin.desktop}
      mobileLength={pin.mobile}
      aria-label={c.ariaLabel}
      className="bg-paper text-ink"
      data-scene="ascent"
      data-tone="dark"
      data-chapter={chapter?.no}
      data-ascent
    >
      {/* [.ascent-view]: the picture layers; clipped into a framed card at the end of the climb. */}
      <div data-ascent-view className="absolute inset-0 overflow-hidden bg-surface-raised">
        {/* [.ascent-forest]: the forest still, 272% tall from -6%, drifting up as the climb starts. */}
        <div data-ascent-forest className="absolute inset-x-0 -top-[6%] h-[272%] will-change-transform motion-reduce:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized LCP image with its own srcset and preload */}
          <img
            src={FOREST.lg}
            srcSet={`${FOREST.sm} 960w, ${FOREST.lg} 1500w`}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            loading="eager"
            decoding="async"
            data-critical-image
            className="size-full object-cover [filter:saturate(.85)_brightness(.8)]"
          />
        </div>
        {/* [.ascent-par] follows the pointer slightly; [.ascent-inner] shrinks with the card at the end. */}
        <div data-ascent-par className="absolute -inset-[2%] will-change-transform">
          <div data-ascent-inner className="absolute inset-0 will-change-transform">
            <div data-ascent-seq className="absolute inset-0 opacity-0 motion-reduce:hidden">
              <ImageSequence
                frames={{ src: "/nathia/seq/hero/lg/{n}.webp", count: 83 }}
                mobileFrames={{ src: "/nathia/seq/hero/m/{n}.webp", count: 83 }}
               
                range={[0.47, 0.9]}
                focusY={0.42}
                mobileFocusY={0.5}
                dprCap={1.6}
                mobileDprCap={1.5}
                scrub={0.9}
                critical
              />
            </div>
            {/* [.ascent-crisp]: the golden-hour still that takes over at the top (and the reduced-motion view). */}
            <picture>
              <source media={MOBILE_QUERY} srcSet="/nathia/img/day-1830-m.webp" />
              <img
                data-ascent-crisp
                src="/nathia/img/day-1830-lg.webp"
                srcSet="/nathia/img/day-1830-sm.webp 960w, /nathia/img/day-1830-lg.webp 2000w"
                sizes="100vw"
                alt="The Reserve's terraced towers above the pines in evening light"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-[50%_42%] opacity-0 motion-reduce:opacity-100"
              />
            </picture>
          </div>
        </div>
        {/* [.ascent-pines]: six silhouettes at three depths falling past the camera. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
          {ascentPines.map((p) => (
            <svg
              key={p.seed}
              data-ascent-pine
              data-depth={p.depth}
              viewBox="0 0 100 108"
              preserveAspectRatio="none"
              className="absolute top-0 h-[115%] fill-paper will-change-transform"
              style={{ left: `${p.left}%`, width: `${p.width}%`, opacity: 0.55 + 0.45 * p.depth }}
            >
              <path d={pinePath(p.seed)} />
            </svg>
          ))}
        </div>
        {/* [.ascent-mist]: WebGL haze (runtime/mist.ts), transparent until it starts; skipped on low-tier devices. */}
        <canvas data-ascent-mist data-print="hide" aria-hidden className="pointer-events-none absolute inset-0 size-full motion-reduce:hidden" />
        {/* [.ascent-shade]: top, bottom and left gradients for legibility. */}
        <div
          data-ascent-shade
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(12_15_13/.55)_0%,transparent_22%),linear-gradient(transparent_36%,rgb(12_15_13/.3)_60%,rgb(12_15_13/.85)_100%),linear-gradient(90deg,rgb(12_15_13/.42)_0%,transparent_52%)]"
        />
      </div>

      {/* [.ascent-gauge]: 0–8,000 ft scale on the right, desktop only. */}
      <div data-ascent-gauge aria-hidden className="pointer-events-none absolute top-[18vh] bottom-[18vh] right-[clamp(20px,4.2vw,72px)] flex gap-3.5 text-ink opacity-0 max-[899px]:hidden motion-reduce:hidden">
        <div className="relative w-[38px]">
          {ticks.map((t) => (
            <span
              key={t}
              className={`absolute right-0 h-px bg-current ${t % 1000 === 0 ? "w-4 opacity-70" : "w-2 opacity-32"}`}
              style={{ bottom: `${(t / ELEVATION_SCALE) * 100}%` }}
            >
              {t % 1000 === 0 && <em className="absolute right-6 -top-[0.55em] font-mono text-[0.6rem] not-italic tracking-[0.08em] opacity-85">{t === 0 ? "0" : `${t / 1000}k`}</em>}
            </span>
          ))}
          <span className="absolute right-0 h-px w-[22px] bg-accent" style={{ bottom: "98.75%" }}>
            <em className="absolute right-[30px] -top-[0.55em] whitespace-nowrap font-mono text-[0.6rem] not-italic tracking-[0.08em] text-accent-soft">The Reserve</em>
          </span>
        </div>
        <div className="relative w-px bg-ink/22">
          <div data-ascent-gauge-mark className="absolute top-full left-0 h-full w-px will-change-transform">
            {/* The marker: a 10px dot with a 20px halo, centred on the line. */}
            <span className="absolute top-0 left-1/2 size-5 -translate-1/2 rounded-full bg-accent-soft/20" />
            <span className="absolute top-0 left-1/2 size-2.5 -translate-1/2 rounded-full bg-accent-soft" />
            <span data-ascent-gauge-num className="absolute left-3.5 -top-[0.6em] whitespace-nowrap font-mono text-[0.66rem] tracking-[0.08em]">0</span>
          </div>
        </div>
      </div>

      {/* [.ascent-words]: words dropping in during the climb, centred above the read-out. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 grid place-items-center motion-reduce:hidden"
        style={{ top: "calc(50% - clamp(5.6rem, 19vw, 21rem) / 1.6129 - 30px)" }}
      >
        {c.words.map((w) => (
          <span
            key={w.at}
            data-ascent-word
            data-at={w.at}
            className="-mr-[0.5em] whitespace-nowrap text-[clamp(0.66rem,0.95vw,0.9rem)] font-medium uppercase tracking-[0.5em] text-ink opacity-0 [grid-area:1/1]"
          >
            {w.text}
          </span>
        ))}
      </div>

      {/* [.ascent-read]: elevation read-out "0,000 FT" with its label. */}
      <div data-ascent-read aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center gap-[18px] text-ink will-change-transform motion-reduce:hidden">
        <span className="flex items-start gap-[0.6vw]">
          <Odometer value={0} final={7900} digits={4} dimClassName="opacity-12" className="font-display text-[clamp(5.6rem,19vw,21rem)] font-semibold tracking-[-0.04em] [&_[data-odometer-col]]:w-[0.54em] [&_[data-odometer-col]]:text-center [&_[data-odometer-sep]]:inline-block [&_[data-odometer-sep]]:w-[0.24em]" />
          <span className="mt-[1.3vw] font-mono text-[clamp(0.7rem,1vw,0.9rem)] tracking-[0.3em] text-accent-soft">FT</span>
        </span>
        <span data-ascent-read-label className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-accent-soft opacity-0">
          {c.mistLine}
        </span>
      </div>

      {/* [.ascent-copy]: eyebrow, the page title, sub-line and CTA. */}
      <div data-ascent-copy className={`absolute inset-x-0 bottom-[9vh] text-ink max-[899px]:bottom-[7vh] ${gx}`}>
        <p data-ascent-after className={`${label} mb-[2.4vh] text-ink [text-shadow:0_1px_18px_rgb(12_15_13/.6)]`}>
          {c.eyebrow}
        </p>
        <h1 data-ascent-title className="max-w-[11.5em] font-display text-hero leading-display font-semibold tracking-display lining-nums max-[899px]:text-[10.4vw]">
          {c.title.map((line, i) => (
            // [.ln]: room for descenders, pulled back so the line spacing is unchanged.
            <span key={i} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              {i > 0 && " "}
              <span data-ascent-line className="block whitespace-nowrap">
                {renderLine(line, "text-accent-soft")}
              </span>
            </span>
          ))}
        </h1>
        <div className="mt-[4vh] flex items-end justify-between gap-8 max-[899px]:flex-col max-[899px]:items-start max-[899px]:gap-[22px]">
          <p data-ascent-after className="max-w-xl text-[0.95rem] leading-[1.6] text-ink/86">
            {/* [.ascent-sub]: the first line, then the rest on new lines in a span. */}
            {c.sub[0]}
            {c.sub.slice(1).map((line) => (
              <Fragment key={line}>
                <br />
                <span>{line}</span>
              </Fragment>
            ))}
          </p>
          {/* [.btn.btn-solid] in a Magnetic: tan, ink text, arrow. */}
          <Magnetic {...magnetic}>
            <Link data-ascent-after href={c.cta.href} className={`${pill} ${pillHover} border-accent bg-accent text-paper ${focusRing}`}>
              <span>{c.cta.label}</span>
              <svg aria-hidden viewBox="0 0 18 10" className="h-2.5 w-[18px]" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M0 5h16.5M12.5 1l4 4-4 4" />
            </svg>
            </Link>
          </Magnetic>
        </div>
      </div>

      {/* [.ascent-cue]: "scroll" with a line that keeps running down; hidden with reduced motion. */}
      <div data-ascent-cue aria-hidden className={`absolute bottom-[4.5vh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3.5 font-mono text-[0.64rem] uppercase tracking-[0.3em] text-ink/80 motion-reduce:hidden`}>
        <span>{c.cue}</span>
        <i className="relative block h-[46px] w-px overflow-hidden bg-ink/20">
          <span className="absolute top-0 left-0 block h-[46%] w-px animate-[nathia-cue_2.2s_cubic-bezier(.65,0,.35,1)_infinite] bg-ink" />
        </i>
      </div>

      {/* [.ascent-caption]: under the framed card at the end, desktop only. */}
      <p data-ascent-caption aria-hidden className={`absolute bottom-[6.5%] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.66rem] uppercase tracking-[0.24em] text-on-ink opacity-0 max-[899px]:hidden`}>
        {c.caption}
      </p>

      {/* [.ascent-flank]: the manifesto's heading and lede rising beside the framed card (the hand-over). */}
      {manifesto && (
        <div aria-hidden className="pointer-events-none absolute inset-0 text-on-ink motion-reduce:hidden">
          <div className="absolute top-[12.5%] right-[calc(65%+2.6vw)] left-[clamp(20px,4.2vw,72px)] grid justify-items-end text-right max-[899px]:top-[calc(68px+1vh)] max-[899px]:right-[clamp(20px,4.2vw,72px)] max-[899px]:justify-items-start max-[899px]:text-left">
            {/* flex: the label is a grid item at the top as live [.ascent-flank-l > .label], not an inline box in a 16px line. */}
            <div data-ascent-flank-fade className="flex opacity-0">
              <SceneLabel no={manifestoChapter ?? ""} tone="light">
                {manifesto.label}
              </SceneLabel>
            </div>
            <h2 className="mt-[3vh] font-display text-[clamp(2.4rem,4.15vw,5rem)] font-semibold leading-[0.98] tracking-[-0.02em] lining-nums max-[899px]:mt-[1.4vh] max-[899px]:text-[8.6vw]">
              {manifesto.heading.map((line, i) => (
                <span key={i} className="block overflow-hidden">
                  {i > 0 && " "}
                  <span data-ascent-flank-line className="block whitespace-nowrap" style={{ transform: "translateY(112%)" }}>
                    {/* Italic parts in the deeper accent [.ascent-flank-head em]. */}
                    {renderLine(line, "text-accent-on-ink")}
                  </span>
                </span>
              ))}
            </h2>
          </div>
          <div className="absolute right-[clamp(20px,4.2vw,72px)] bottom-[12.5%] left-[calc(65%+2.6vw)] max-[899px]:top-[calc(76%+2vh)] max-[899px]:bottom-auto max-[899px]:left-[clamp(20px,4.2vw,72px)]">
            <p className="font-display text-[clamp(1.3rem,1.9vw,2.1rem)] leading-[1.22] font-medium tracking-[-0.005em] max-[899px]:text-[4.3vw]">
              {manifesto.lede.map((line, i) => (
                // [.ln]: room for descenders, pulled back so the line spacing is unchanged.
                <span key={i} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                  {i > 0 && " "}
                  <span data-ascent-lede-line className="block" style={{ transform: "translateY(112%)" }}>
                    {line}
                  </span>
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      <AscentMotion sceneId={c.id} words={c.words.map((w) => w.at)} />
    </PinnedSection>
  );
}
