import Link from "next/link";
import { ClipReveal, Parallax, Reveal, RiseLines, ScrubText } from "@/components/motion";
import { renderLines } from "../line";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { surfaceStyle } from "../scenes";
import { body, display, displayEm, elevateTiming as t, focusRing, gx, sectionTiming as s, textLink } from "../tokens";
import { NathiaImg } from "../NathiaImg";

/**
 * Scene 12, Elevate Holdings [section.el]: the founder's portrait (sticky beside the text on desktop) opens as
 * a curtain from the bottom, then the heading, the story, his quote (words brighten with the scroll), the
 * credits and the link to the developer page. Reduced motion: everything static.
 */
export function Elevate({ scene, chapter }: SceneProps) {
  if (scene.type !== "elevate") return null;
  const { className, tone } = surfaceStyle.paper;
  const fade = { y: s.fadeY, duration: s.fadeDuration, at: s.fadeAt } as const;

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      className={`relative py-[20vh] ${className}`}
    >
      {/* [.el-grid]: plate | text; one column on mobile. */}
      <div className={`grid grid-cols-[0.8fr_1.2fr] items-start gap-[7vw] max-[899px]:grid-cols-1 ${gx}`}>
        {/* [.el-plate]: 4:5, sticky 12vh from the top (desktop). */}
        <ClipReveal
          from={t.plateFrom}
          scale={t.plateScale}
          duration={t.plateDuration}
          scaleDuration={t.plateSettle}
          ease="inOut"
          fade={false}
          at={t.plateAt}
          className="sticky top-[12vh] aspect-[4/5] rounded-[3px] max-[899px]:relative max-[899px]:top-0 max-[899px]:w-[78%]"
        >
          <Parallax drift={{ yPercent: [...t.plateDrift.yPercent] }} className="absolute inset-0">
            <NathiaImg name={scene.image.img} alt={scene.image.alt} sizes="(min-width: 900px) 34vw, 86vw" className="object-cover object-[50%_30%]" />
          </Parallax>
        </ClipReveal>

        <div>
          <Reveal {...fade}>
            <SceneLabel no={scene.marker ?? chapter?.no ?? ""} tone="dark">
              {scene.label}
            </SceneLabel>
          </Reveal>
          <RiseLines
            lines={renderLines(scene.heading, `${displayEm} text-accent-soft`)}
            trigger="section"
            at={s.headAt.elevate}
            stagger={s.headStagger}
            duration={s.headDuration}
            className={`${display} mt-[4vh] text-[clamp(3rem,6.8vw,8rem)]`}
          />
          {scene.body.map((paragraph) => (
            <Reveal key={paragraph} as="p" {...fade} className={`${body} mt-[4vh] text-ink/82`}>
              {paragraph}
            </Reveal>
          ))}

          {/* [.el-quote]: italic display; the marks stay at full strength, the words brighten with the scroll. */}
          <ScrubText
            as="blockquote"
            lines={scene.quote}
            dim={t.quoteDim}
            stagger={t.quoteStagger}
            start={t.quoteStart}
            end={t.quoteEnd}
            before={
              <span aria-hidden className="absolute -top-[0.1em] -left-[0.5em] text-accent-soft max-[899px]:static">
                “
              </span>
            }
            after={
              <span aria-hidden className="text-accent-soft">
                ”
              </span>
            }
            className={`${display} relative mt-[10vh] text-[clamp(1.9rem,3.4vw,3.6rem)] leading-[1.12] italic`}
          />
          <Reveal as="p" {...fade} className="mt-[4vh] font-mono text-[0.72rem] uppercase tracking-[0.2em]">
            {scene.cite} <span className="text-accent-soft">· {scene.citeRole}</span>
          </Reveal>

          {/* [.el-credits] */}
          <Reveal as="dl" {...fade} className="mt-[8vh] mb-[6vh] grid grid-cols-2 gap-[3vw] border-y border-line py-[3vh]">
            {scene.credits.map((credit) => (
              <div key={credit.k}>
                <dt className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-accent-soft">{credit.k}</dt>
                <dd className={`${display} mt-2.5 text-[clamp(1.4rem,2vw,2rem)]`}>{credit.v}</dd>
              </div>
            ))}
          </Reveal>

          {/* [.link]: underlined, the rule retracts on hover. */}
          <Reveal {...fade}>
            <Link
              href={scene.more.href}
              className={`${textLink} ${focusRing}`}
            >
              {scene.more.label}
              <svg aria-hidden viewBox="0 0 16 9" className="h-[9px] w-4" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M0 4.5h15M11 0.5l4 4-4 4" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
