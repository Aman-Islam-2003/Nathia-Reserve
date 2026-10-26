import Link from "next/link";
import type { CSSProperties } from "react";
import { PinnedSection, Reveal, RiseLines } from "@/components/motion";
import { Arrow } from "../Arrow";
import { renderLines } from "../line";
import { NathiaImg } from "../NathiaImg";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { body, displayEm, estateTiming as t, focusRing, gx, lede, sectionTiming as s, textLink } from "../tokens";
import { EstateMotion } from "./EstateMotion";

/** A line inside its mask [.ln / .ln-i]: room below for descenders, pulled back so spacing is unchanged. */
const mask = "-mb-[0.1em] block overflow-clip pb-[0.1em]";
/** Display headings here set their own leading, so the display token (whose leading would win) isn't used. */
const displayFace = "font-display font-semibold tracking-[-0.015em] lining-nums";

/**
 * Scene 08, the estate [section.es]: the intro (with the two towers and the skywalk between them), a row of
 * rooms that widen on hover or focus (a swipe strip on phones, as live), then a film pinned for .72 viewports
 * per chapter (.66 on phones): five chapters of photos and videos crossfading, each with its card, the chapter
 * count, the skywalk's depth gauge and a bar of chapter buttons; then Tower B. Reduced motion (as live): no
 * pin, the first chapter, and the buttons switch chapters; videos stay on their posters.
 */
export function Estate({ scene, chapter }: SceneProps) {
  if (scene.type !== "estate") return null;
  const { className, tone } = surfaceStyle[sceneLayout.estate.surface];
  const fade = { y: s.fadeY, duration: s.fadeDuration, at: s.fadeAt } as const;
  const chapters = scene.chapters;
  const last = chapters[chapters.length - 1].no;

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      className={`relative pt-[20vh] max-[899px]:pt-[12vh] ${className}`}
    >
      {/* [.es-intro] */}
      <header data-es-intro className={gx}>
        <Reveal {...fade}>
          <SceneLabel no={chapter?.no ?? ""} tone="dark">
            {scene.label}
          </SceneLabel>
        </Reveal>
        <RiseLines
          lines={renderLines(scene.heading, `${displayEm} text-accent-soft`)}
          trigger="[data-es-intro]"
          at={t.head.at}
          stagger={t.head.stagger}
          duration={t.head.duration}
          className={`mt-[4vh] ${displayFace} text-[clamp(3rem,8.4vw,10rem)] leading-[0.92] max-[899px]:text-[11vw]`}
        />
        <div className="mt-[7vh] flex items-end justify-between gap-[4vw] max-[899px]:flex-col max-[899px]:items-start">
          {scene.body && (
            <Reveal {...fade} as="p" className={`${body} text-ink/80`}>
              {scene.body}
            </Reveal>
          )}
          {/* [.es-towers]: Tower A —(Glass skywalk)— Tower B. */}
          <Reveal {...fade} as="p" className="inline-flex items-center gap-[18px] whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent-soft">
            <span>{scene.towers[0]}</span>
            <i className="relative h-px w-[150px] bg-current/60 before:absolute before:-top-[3px] before:-left-[3px] before:size-[7px] before:rounded-full before:bg-current before:content-[''] after:absolute after:-top-[3px] after:-right-[3px] after:size-[7px] after:rounded-full after:bg-current after:content-['']">
              <em className="absolute bottom-[9px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] not-italic tracking-[0.2em] text-accent-on-ink">{scene.skywalk}</em>
            </i>
            <span>{scene.towers[1]}</span>
          </Reveal>
        </div>
      </header>

      {/* [.es-rooms-wrap] */}
      <div className={`pt-[12vh] ${gx}`}>
        <Reveal {...fade}>
          <SceneLabel no="+" tone="dark">
            {scene.roomsLabel}
          </SceneLabel>
        </Reveal>
        {/* [.es-rooms]: each room widens on hover or focus (flex 1 → 3.4, 1 s); a snap strip on phones. */}
        <Reveal
          yPercent={t.rooms.yPercent}
          stagger={t.rooms.stagger}
          duration={t.rooms.duration}
          at={t.rooms.at}
          className="mt-[5vh] flex h-[64vh] gap-2.5 max-[899px]:-mx-[clamp(20px,4.2vw,72px)] max-[899px]:h-auto max-[899px]:snap-x max-[899px]:snap-mandatory max-[899px]:overflow-x-auto max-[899px]:px-[clamp(20px,4.2vw,72px)]"
        >
          {scene.rooms.map((room) => (
            // Focusable as live: keyboard users get the same widening as the pointer [.es-room:focus-visible].
            <figure
              key={room.img}
              tabIndex={0}
              data-cursor="View"
              className={`group relative min-w-0 flex-1 cursor-pointer overflow-hidden rounded-[3px] transition-[flex-grow] duration-1000 ease-[var(--theme-ease)] motion-reduce:transition-none after:absolute after:inset-0 after:bg-linear-to-b after:from-paper/0 after:from-45% after:to-paper/82 after:content-[''] hover:grow-[3.4] focus-visible:grow-[3.4] max-[899px]:h-[54vh] max-[899px]:flex-[0_0_72vw] max-[899px]:snap-start max-[899px]:hover:grow-0 ${focusRing}`}
            >
              <NathiaImg
                name={room.img}
                alt={room.alt}
                sizes="(min-width: 900px) 40vw, 80vw"
                className="object-cover transition-transform duration-[1400ms] ease-[var(--theme-ease)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <figcaption className="absolute right-5 bottom-5 left-5 z-1 grid gap-1.5">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent-soft">{room.line}</span>
                <b className={`${displayFace} whitespace-nowrap text-[clamp(1.1rem,1.6vw,1.8rem)] leading-[1.1]`}>{room.name}</b>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>

      {/* [.es-film]: pinned .72 viewports per chapter (.66 on phones). */}
      <div className="mt-[16vh] max-[899px]:mt-[10vh]">
        <PinnedSection
          as="div"
          id="estate-film"
          aria-label={scene.filmLabel}
          length={chapters.length * t.pinPerChapter.desktop}
          mobileLength={chapters.length * t.pinPerChapter.mobile}
          className="bg-paper text-ink"
        >
          {/* [.es-shots] */}
          <div data-es-shots className="absolute inset-0 max-[899px]:bottom-auto max-[899px]:h-[56svh]">
            {chapters.map((c, i) => (
              <div key={c.no} data-es-shot className="absolute inset-0 overflow-hidden" style={{ opacity: i === 0 ? 1 : 0, "--focus": c.focus } as CSSProperties}>
                <div data-es-shot-in className="absolute inset-0 will-change-transform">
                  <div data-es-shot-pan className="absolute inset-0 will-change-transform">
                    {c.video ? (
                      // Files and poster set by the runtime when the film is near, as live (nothing loads with the page).
                      <video
                        data-lg={`/nathia/video/${c.video}.mp4`}
                        data-sm={`/nathia/video/${c.video}-sm.mp4`}
                        data-poster={`/nathia/video/${c.video}.webp`}
                        data-poster-sm={`/nathia/video/${c.video}-sm.webp`}
                        data-mode={c.video.endsWith("-loop") ? "loop" : "hold"}
                        loop={c.video.endsWith("-loop")}
                        muted
                        playsInline
                        preload="none"
                        aria-label={c.alt}
                        className="absolute inset-0 size-full object-cover object-(--focus)"
                      />
                    ) : (
                      <NathiaImg name={c.img} alt={c.alt} sizes="100vw" className="object-cover object-(--focus)" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* [.es-film-shade] */}
          <div
            aria-hidden
            data-print="hide"
            className="pointer-events-none absolute inset-0 z-3 bg-[linear-gradient(#0c0f0d80_0%,#0c0f0d00_22%),linear-gradient(90deg,#0c0f0d8c_0%,#0c0f0d00_52%),linear-gradient(#0c0f0d00_44%,#0c0f0d9e_76%,#0c0f0deb_100%)] max-[899px]:bg-[linear-gradient(180deg,#0c0f0d73_0%,#0c0f0d00_14%),linear-gradient(0deg,var(--theme-paper)_44%,#0c0f0d99_50%,#0c0f0d00_62%)]"
          />
          {/* [.es-count]: I / V */}
          <p aria-hidden data-print="hide" className="absolute top-[calc(84px+2vh)] right-[clamp(20px,4.2vw,72px)] z-4 flex items-baseline gap-2.5 font-mono text-[0.74rem] tracking-[0.2em] max-[899px]:hidden">
            <b data-es-count className={`${displayFace} min-w-[1.6em] text-right text-[2.6rem] leading-none tracking-normal`}>
              {chapters[0].no}
            </b>
            <span className="text-accent-soft">/ {last}</span>
          </p>
          {/* [.es-cards] */}
          <div data-es-cards className="absolute bottom-[calc(5vh+78px)] left-[clamp(20px,4.2vw,72px)] z-4 grid w-[min(46rem,56vw)] max-[899px]:top-[47svh] max-[899px]:right-[clamp(20px,4.2vw,72px)] max-[899px]:bottom-auto max-[899px]:w-auto">
            {chapters.map((c, i) => (
              <article key={c.no} data-es-card className="self-end [grid-area:1/1] max-[899px]:self-start" style={{ opacity: i === 0 ? 1 : 0 }}>
                <p data-es-fx className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent-soft">
                  {scene.chapterWord} {c.no} · {c.kicker}
                </p>
                <h3 className={`mt-[1.4vh] ${displayFace} text-[clamp(3.2rem,6.6vw,8rem)] leading-[0.95] [text-shadow:0_2px_40px_rgb(12_15_13/.35)] max-[899px]:mt-[1vh] max-[899px]:text-[2.7rem]`}>
                  <span className={mask}>
                    <span data-es-line className="block">
                      {c.title}
                    </span>
                  </span>
                </h3>
                <p data-es-fx className={`mt-[2.6vh] ${body} max-w-[34rem] text-ink/88 max-[899px]:mt-[1.6vh] max-[899px]:text-[0.92rem] max-[899px]:leading-[1.55]`}>
                  {c.body}
                </p>
                {c.list.length > 0 && (
                  <ul
                    data-es-fx
                    className="mt-[2.8vh] flex w-max max-w-[calc(100vw-2*clamp(20px,4.2vw,72px))] flex-wrap gap-y-2 text-[0.68rem] uppercase tracking-[0.16em] text-accent-soft max-[899px]:mt-[2vh] max-[899px]:grid max-[899px]:w-auto max-[899px]:gap-[7px] max-[899px]:text-[0.6rem] max-[899px]:tracking-[0.14em]"
                  >
                    {c.list.map((item, k) => (
                      <li
                        key={item}
                        // A dot before every item but the first [li+li:before], before every item below 900px [li:before].
                        className={`whitespace-nowrap before:size-1 before:rounded-full before:bg-current before:align-middle before:opacity-60 before:content-[''] ${k > 0 ? "before:mx-3.5 before:mb-0.5 before:inline-block" : "before:hidden max-[899px]:before:mb-0.5 max-[899px]:before:inline-block"} max-[899px]:before:ml-0 max-[899px]:before:mr-2.5`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {c.below && (
                  <p data-es-fx className="mt-[2.8vh] inline-flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent-on-ink max-[899px]:mt-[1.8vh] max-[899px]:text-[0.6rem]">
                    <Arrow dir="down" className="h-2.5 w-3.5" /> {c.below}
                  </p>
                )}
              </article>
            ))}
          </div>
          {/* [.es-gauge]: the skywalk's depth, shown on its chapter. */}
          <div
            aria-hidden
            data-es-gauge
            data-print="hide"
            className="pointer-events-none absolute top-[24vh] right-[clamp(20px,4.2vw,72px)] bottom-[30vh] z-4 flex items-start gap-4 opacity-0 transition-opacity duration-800 ease-[var(--theme-ease)] data-on:opacity-100 max-[899px]:top-[calc(68px+4svh)] max-[899px]:bottom-auto max-[899px]:h-[30svh] max-[899px]:gap-2.5"
          >
            <span className="relative h-full w-px bg-ink/25">
              <i data-es-gauge-fill className="absolute inset-0 origin-top bg-ink" style={{ transform: "scaleY(0)" }} />
            </span>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent-on-ink [text-shadow:0_1px_12px_rgb(0_0_0/.6)]">
              <b data-es-gauge-num className="block font-display text-[3.4rem] leading-none font-semibold tracking-[-0.02em] text-ink tabular-nums lining-nums max-[899px]:text-[2.4rem]">
                0
              </b>{" "}
              {scene.gauge.unit}
            </span>
          </div>
          {/* [.es-bar]: chapter buttons; a click scrolls to that chapter (without the pin: switches to it). */}
          <div
            role="group"
            aria-label={scene.barLabel}
            data-print="hide"
            className="absolute right-[clamp(20px,4.2vw,72px)] bottom-[5vh] left-[clamp(20px,4.2vw,72px)] z-4 grid grid-cols-5 gap-3.5 max-[899px]:bottom-[11vh] max-[899px]:gap-2"
          >
            {chapters.map((c, i) => (
              <button
                key={c.no}
                type="button"
                data-es-seg={i}
                data-cursor="hide"
                aria-label={`${scene.chapterWord} ${c.no}: ${c.title}`}
                aria-pressed={i === 0}
                className={`grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-2.5 text-left text-ink opacity-50 transition-opacity duration-500 ease-[var(--theme-ease)] hover:opacity-100 aria-pressed:opacity-100 max-[899px]:gap-2 ${focusRing}`}
              >
                <span className="relative col-span-full h-0.5 overflow-hidden rounded-[2px] bg-ink/25">
                  <i data-es-fill className="absolute inset-0 origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
                </span>
                <span className="font-mono text-[0.72rem] tracking-[0.12em] text-accent-soft">{c.no}</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.78rem] font-semibold uppercase tracking-[0.18em] max-[899px]:hidden">{c.title}</span>
              </button>
            ))}
          </div>
        </PinnedSection>
      </div>

      {/* [.es-towerb] */}
      <div data-es-towerb className="px-[clamp(20px,4.2vw,72px)] pt-[22vh] pb-[20vh]">
        <RiseLines
          lines={renderLines(scene.towerB.heading, `${displayEm} text-accent-soft`)}
          trigger="[data-es-towerb]"
          at={t.towerB.at}
          stagger={t.towerB.stagger}
          duration={t.towerB.duration}
          className={`${displayFace} text-[clamp(3rem,9vw,11rem)] leading-[0.92]`}
        />
        <div className="mt-[6vh] grid grid-cols-[minmax(0,44rem)_auto] items-end justify-between gap-[4vw] max-[899px]:grid-cols-1">
          <Reveal {...fade} as="p" className={`${lede} text-ink/86`}>
            {scene.towerB.body}
          </Reveal>
          {/* A grid, so the link stretches across its cell as live's (the link is the grid item there). */}
          <Reveal {...fade} className="grid">
            <Link href={scene.towerB.more.href} className={`${textLink} ${focusRing}`}>
              {scene.towerB.more.label} <Arrow className="h-[9px] w-4" />
            </Link>
          </Reveal>
        </div>
      </div>

      <EstateMotion sceneId={scene.id} chapters={chapters.map((c) => c.no)} gaugeFeet={scene.gauge.feet} gaugeChapter={chapters.findIndex((c) => c.below)} />
    </section>
  );
}
