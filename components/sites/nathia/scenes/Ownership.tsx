import { ClipReveal, Parallax, Reveal, RiseLines } from "@/components/motion";
import { renderLines } from "../line";
import { SceneLabel } from "../SceneLabel";
import type { SceneProps } from "../SceneSkeleton";
import { surfaceStyle } from "../scenes";
import { body, display, displayEm, gx, lede, ownershipTiming as t, sectionTiming as s } from "../tokens";
import { OwnershipMotion } from "./OwnershipMotion";
import { NathiaImg } from "../NathiaImg";

/** Row with a rule above (and below the last) [.ow-list li, .ow-prices li, .ow-approvals li]. */
const row = "border-t border-line-on-light last:border-b";

/**
 * Scene 10, a commercial asset [section.ow]: heading and lede, the four points, the arrival plate, the payment
 * structure along a line that draws with the scroll, the prices from the residences data, and the approvals
 * with their check marks drawing in. Reduced motion: everything static, line full, checks drawn.
 */
export function Ownership({ scene, chapter, site }: SceneProps) {
  if (scene.type !== "ownership") return null;
  const { className, tone } = surfaceStyle.ink;
  const fade = { y: s.fadeY, duration: s.fadeDuration, at: s.fadeAt } as const;

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      className={`relative pt-[20vh] pb-[18vh] ${className}`}
    >
      <div className={gx}>
        <Reveal {...fade}>
          <SceneLabel no={scene.marker ?? chapter?.no ?? ""} tone="light">
            {scene.label}
          </SceneLabel>
        </Reveal>
        <RiseLines
          lines={renderLines(scene.heading, `${displayEm} text-accent-on-ink`)}
          trigger="section"
          at={s.headAt.ownership}
          stagger={s.headStagger}
          duration={s.headDuration}
          className={`${display} mt-[4vh] text-[clamp(3rem,7.6vw,9rem)] max-[899px]:text-[9.4vw]`}
        />

        {/* [.ow-grid]: copy and points | the plate. */}
        <div className="mt-[10vh] grid grid-cols-[1.15fr_0.85fr] items-start gap-[6vw] max-[899px]:grid-cols-1">
          <div>
            <Reveal as="p" {...fade} className={lede}>
              {scene.lede}
            </Reveal>
            <Reveal as="ul" x={t.listX} y={0} stagger={t.listStagger} duration={t.rowDuration} at={t.listAt} className="mt-[6vh]">
              {scene.list.map((point) => (
                <li key={point} className={`flex items-center gap-4 py-4 ${row}`}>
                  <span aria-hidden className="size-[7px] flex-none rounded-full bg-accent-on-ink" />
                  {point}
                </li>
              ))}
            </Reveal>
          </div>
          <ClipReveal from={t.plateFrom} scrub={t.plateScrub} className="relative aspect-[4/5] rounded-[3px]">
            <Parallax drift={{ yPercent: [...t.plateDrift.yPercent], scale: [...t.plateDrift.scale] }} className="absolute inset-0">
              <NathiaImg name={scene.image.img} alt={scene.image.alt} sizes="(min-width: 900px) 36vw, 90vw" className="object-cover" />
            </Parallax>
          </ClipReveal>
        </div>

        {/* [.ow-structure]: the payment plan along a line that draws with the scroll (OwnershipMotion). */}
        <div data-ow-structure className="mt-[16vh]">
          <Reveal {...fade}>
            <SceneLabel as="h3" no="%" tone="light">
              {scene.structureTitle}
            </SceneLabel>
          </Reveal>
          <div className="relative mt-[6vh] grid grid-cols-4 pt-[26px] max-[899px]:grid-cols-2 max-[899px]:gap-y-[6vh]">
            <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-line-on-light max-[899px]:hidden">
              <i data-ow-line className="absolute inset-0 origin-left bg-on-ink" />
            </span>
            {scene.structure.map((stop) => (
              <div key={stop.label} data-ow-stop className="relative grid gap-2">
                <span aria-hidden className="absolute -top-[30px] left-0 size-[9px] rounded-full border border-on-ink bg-ink max-[899px]:hidden" />
                <b className={`${display} text-[clamp(3rem,6.4vw,7.4rem)] leading-none tracking-[-0.03em]`}>{stop.value}</b>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-on-ink/70">{stop.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* [.ow-prices]: starting price per residence type (site data), sold-out types marked. */}
        <div className="mt-[14vh] max-[899px]:mt-[10vh]">
          <Reveal {...fade}>
            <SceneLabel as="h3" no="PKR" tone="light">
              {scene.pricesTitle}
            </SceneLabel>
          </Reveal>
          <Reveal as="ul" y={t.priceY} stagger={t.priceStagger} duration={t.rowDuration} at={t.priceAt} className="mt-[4vh]">
            {site.residences.map((r) => (
              <li key={r.id} className={`flex items-baseline justify-between gap-6 py-[22px] max-[899px]:py-[18px] ${row}`}>
                <span className={`${display} text-[clamp(1.4rem,2.6vw,2.8rem)] leading-[1.1] ${r.soldOut ? "text-on-ink/50" : ""}`}>{r.name}</span>
                {r.soldOut ? (
                  <span className="rounded-full border border-line-on-light px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent-on-ink max-[899px]:text-[0.58rem] max-[899px]:tracking-[0.16em]">
                    {scene.priceLabels.soldOut}
                  </span>
                ) : (
                  <span className="inline-flex items-baseline gap-3 whitespace-nowrap max-[899px]:gap-2">
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-on-ink/62 max-[899px]:text-[0.58rem] max-[899px]:tracking-[0.16em]">{scene.priceLabels.from}</span>
                    <b className={`${display} text-[clamp(2rem,3.6vw,3.8rem)] leading-none tracking-[-0.01em]`}>{r.priceCrore}</b>
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-on-ink/62 max-[899px]:text-[0.58rem] max-[899px]:tracking-[0.16em]">{scene.priceLabels.unit}</span>
                  </span>
                )}
              </li>
            ))}
          </Reveal>
          <Reveal as="p" {...fade} className={`${body} mt-[4vh] max-w-[44em] text-on-ink/78`}>
            {scene.pricing}
          </Reveal>
        </div>

        {/* [.ow-approvals]: check marks draw in one after another (OwnershipMotion). */}
        <div data-ow-approvals className="mt-[14vh]">
          <Reveal {...fade}>
            <SceneLabel as="h3" no="✓" tone="light">
              {scene.approvalsTitle}
            </SceneLabel>
          </Reveal>
          <ul className="mt-[4vh]">
            {scene.approvals.map((approval) => (
              <li key={approval} className={`flex items-center gap-[22px] py-[22px] ${row}`}>
                <svg aria-hidden viewBox="0 0 24 24" className="size-[30px] flex-none">
                  {/* Drawn in full in the markup; the runtime rewinds it before drawing it in. */}
                  <path data-ow-check d="M4 12.5l5 5L20 6.5" pathLength={1} fill="none" className="stroke-on-ink [stroke-dasharray:1] [stroke-width:1.4px]" />
                </svg>
                <span className={`${display} text-[clamp(1.4rem,2.6vw,2.8rem)] leading-[1.1]`}>{approval}</span>
              </li>
            ))}
          </ul>
          <Reveal as="p" {...fade} className="mt-[4vh] font-mono text-[0.72rem] uppercase tracking-[0.22em] text-accent-on-ink">
            {scene.works}
          </Reveal>
        </div>
      </div>
      <OwnershipMotion sceneId={scene.id} />
    </section>
  );
}
