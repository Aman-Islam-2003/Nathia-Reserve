import Link from "next/link";
import { Magnetic, Reveal, RiseLines } from "@/components/motion";
import { Arrow } from "../Arrow";
import { renderLines } from "../line";
import { fill } from "../returns";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { body, displayEm, focusRing, magnetic, pillHover } from "../tokens";

/**
 * Scene 14, register your interest [section.rc]: the heading, a line on the founders' release, the Register
 * pill (Magnetic) with the terms beside it, and three numbered promises. Heading lines rise when the section
 * reaches 70%; the label, body, button row and promises fade up in turn (.08 s apart) when it reaches 62%
 * [RegisterCta]. Reduced motion: static.
 */
export function RegisterCta({ scene, chapter, site }: SceneProps) {
  if (scene.type !== "register") return null;
  const { className, tone } = surfaceStyle[sceneLayout.register.surface];
  // The lowest starting price on offer [RegisterCta: d].
  const from = site.residences
    .filter((r) => !r.soldOut && r.priceCrore)
    .map((r) => r.priceCrore)
    .sort((a, b) => Number(a) - Number(b))[0];
  // One trigger for every fade, in turn [.rc-fade: y 22, 1.1 s, stagger .08 at "top 62%"].
  const fade = (i: number) => ({ trigger: "section", at: 0.62, y: 22, duration: 1.1, delay: i * 0.08 }) as const;

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      className={`relative pt-[20vh] pb-[18vh] max-[899px]:pt-[14vh] max-[899px]:pb-[12vh] ${className}`}
    >
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center gap-[7vw] px-[clamp(20px,4.2vw,72px)] max-[899px]:grid-cols-1 max-[899px]:gap-[6vh]">
        <div>
          <Reveal {...fade(0)}>
            <SceneLabel no={scene.marker ?? chapter?.no ?? ""} tone="dark">
              {scene.label}
            </SceneLabel>
          </Reveal>
          <RiseLines
            lines={renderLines(scene.heading, `${displayEm} text-accent-soft`)}
            trigger="section"
            at={0.7}
            stagger={0.1}
            duration={1.3}
            className="mt-[4vh] font-display text-[clamp(3rem,7.6vw,9rem)] leading-[0.92] font-semibold tracking-[-0.015em] lining-nums"
          />
          {scene.body && (
            <Reveal {...fade(1)} as="p" className={`${body} mt-[4vh] text-ink/82`}>
              {scene.body}
            </Reveal>
          )}
          {/* [.rc-cta] */}
          <Reveal {...fade(2)} className="mt-[6vh] flex flex-wrap items-center gap-x-7 gap-y-[18px]">
            <Magnetic strength={magnetic.strength} duration={magnetic.duration} ease={magnetic.ease}>
              {/* [.btn.btn-solid.rc-btn]: 60px tall, 32px padding. */}
              <Link
                href={scene.cta.href}
                data-cursor="hide"
                className={`inline-flex h-[60px] items-center gap-[0.9em] rounded-full border border-accent bg-accent px-8 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-paper ${pillHover} ${focusRing}`}
              >
                <span>{scene.cta.label}</span>
                <Arrow className="h-2.5 w-[18px]" />
              </Link>
            </Magnetic>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-accent-soft">{fill(scene.note, { price: from })}</span>
          </Reveal>
        </div>
        {/* [.rc-promises] */}
        <ol className="m-0 max-w-[36rem] list-none p-0">
          {scene.promises.map((p, i) => (
            <Reveal key={p.no} as="li" {...fade(3 + i)} className="grid grid-cols-[3.4rem_1fr] gap-4 border-t border-line py-[18px] last:border-b">
              <span className="font-display text-[1.6rem] leading-[1.1] font-semibold tracking-[-0.015em] text-accent-soft lining-nums">{p.no}</span>
              <p className="text-[0.98rem] leading-[1.6] text-ink/80">
                <strong className="font-medium text-ink">{p.title}</strong> {p.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
