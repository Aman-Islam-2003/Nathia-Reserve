import { Reveal, RiseLines } from "@/components/motion";
import { renderLines } from "../line";
import { ReturnsCalc } from "../ReturnsCalc";
import { fill, topYield } from "../returns";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { sceneLayout, surfaceStyle } from "../scenes";
import { body, displayEm, sectionTiming as s } from "../tokens";

/**
 * Scene 12, what it earns [section.rt]: the heading, the lede, the best yield at the planned figures ("Up to
 * 35%"), the calculator (ReturnsCalc: residence, nightly rate, occupancy → the yearly figures) and the
 * assumptions with the caveat. Heading lines rise when the section reaches 70%; the rest fades up at 88%; the
 * figures rise in turn. Reduced motion: static.
 */
export function Returns({ scene, chapter, site }: SceneProps) {
  if (scene.type !== "returns") return null;
  const { className, tone } = surfaceStyle[sceneLayout.returns.surface];
  const fade = { y: s.fadeY, duration: s.fadeDuration, at: s.fadeAt } as const;
  const { nightlyRate, occupancyPct, managementPct, instalmentPct } = site.rental;
  // The residences on offer: unsold, priced, with a planned nightly rate [Returns: d].
  const options = site.residences
    .filter((r) => !r.soldOut && r.priceCrore && nightlyRate[r.name])
    .map((r) => ({ id: r.id, name: r.name, priceCrore: r.priceCrore, rate: nightlyRate[r.name] }));
  const best = topYield(
    options.map((o) => ({ priceCrore: Number(o.priceCrore), rate: o.rate })),
    occupancyPct,
    managementPct,
  );

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      className={`relative pt-[20vh] pb-[18vh] ${className}`}
    >
      <div className="px-[clamp(20px,4.2vw,72px)]">
        <Reveal {...fade}>
          <SceneLabel no={scene.marker ?? chapter?.no ?? ""} tone="dark">
            {scene.label}
          </SceneLabel>
        </Reveal>
        <RiseLines
          lines={renderLines(scene.heading, `${displayEm} text-accent`)}
          trigger="section"
          at={0.7}
          stagger={s.headStagger}
          duration={s.headDuration}
          className="mt-[4vh] font-display text-4xl leading-[0.92] font-semibold tracking-[-0.015em] lining-nums"
        />
        <Reveal {...fade} as="p" className={`${body} mt-[5vh] max-w-[54ch] text-muted`}>
          {scene.lede}
        </Reveal>
        {/* [.rt-top] */}
        <Reveal {...fade} as="p" className="mt-[8vh] flex flex-wrap items-baseline gap-[clamp(0.8rem,1.6vw,1.6rem)] border-b border-line pb-[4vh] max-[899px]:mt-[6vh]">
          <strong className="font-display text-[clamp(3.4rem,9vw,8rem)] leading-[0.9] font-medium tracking-[-0.015em] text-accent lining-nums">
            {fill(scene.top.lead, { pct: best })}
          </strong>
          <span className="max-w-[26ch] text-base leading-[1.6] text-muted">{fill(scene.top.tail, { occ: occupancyPct })}</span>
        </Reveal>
        {/* [.rt-calc] */}
        <Reveal {...fade} className="mt-[8vh] grid grid-cols-[0.95fr_1.05fr] items-start gap-[clamp(2rem,5vw,5rem)] max-[899px]:grid-cols-1">
          <ReturnsCalc scene={scene} options={options} occupancy={occupancyPct} managementPct={managementPct} instalmentPct={instalmentPct} />
        </Reveal>
        {/* [.rt-notes] */}
        <Reveal
          {...fade}
          className="mt-[12vh] grid grid-cols-2 items-start gap-[clamp(2rem,5vw,5rem)] border-t border-line pt-[5vh] max-[899px]:grid-cols-1 max-[899px]:gap-12"
        >
          <h3 className="col-span-full mb-[3vh] inline-flex text-xs leading-[1.6] font-medium uppercase tracking-[0.26em]">{scene.assumptionsTitle}</h3>
          <ul className="m-0 grid list-disc gap-[1.1rem] pl-[1.1rem]">
            {scene.assumptions.map((a) => (
              <li key={a} className="text-[0.95rem] leading-[1.6] text-muted">
                {a}
              </li>
            ))}
          </ul>
          <p className="m-0 text-[0.82rem] leading-[1.65] text-muted/78">{scene.caveat}</p>
        </Reveal>
      </div>
    </section>
  );
}
