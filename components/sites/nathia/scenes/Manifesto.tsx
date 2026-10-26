import { ClipReveal, Parallax, Reveal, ScrubText } from "@/components/motion";
import type { SceneProps } from "../SceneSkeleton";
import { surfaceStyle } from "../scenes";
import { gx, manifestoTiming as t } from "../tokens";
import { NathiaImg } from "../NathiaImg";

/**
 * Scene 02, the Reserve [section.mf]: a plate that opens from a smaller frame as it scrolls in while its photo
 * drifts and settles, and the statement whose words brighten with the scroll, then the body. (The chapter's
 * heading and lede lines rise in the Ascent's closing flank.) Reduced motion: everything static and visible.
 */
export function Manifesto({ scene, chapter }: SceneProps) {
  if (scene.type !== "manifesto") return null;
  const { className, tone } = surfaceStyle.ink;

  return (
    <section
      id={scene.id}
      data-scene={scene.type}
      data-tone={tone}
      data-chapter={chapter?.no}
      aria-label={scene.label}
      // [.mf]: 14vh / 16vh padding (10vh / 12vh mobile), pulled up 1px over the Ascent's edge.
      className={`relative -mt-px pt-[14vh] pb-[16vh] max-[899px]:pt-[10vh] max-[899px]:pb-[12vh] ${className}`}
    >
      {/* [.mf-grid]: 12 columns, 2vw gutter; one column on mobile, 6vh apart. */}
      <div className={`grid grid-cols-12 items-center gap-x-[2vw] max-[899px]:grid-cols-1 max-[899px]:gap-y-[6vh] ${gx}`}>
        {/* [.mf-plate-a]: 4:5, 3px radius, columns 1–5 (78% wide on mobile). */}
        <ClipReveal
          from={t.plateFrom}
          scrub={t.plateScrub}
          className="col-span-5 col-start-1 aspect-[4/5] rounded-[3px] max-[899px]:col-auto max-[899px]:w-[78%]"
        >
          <Parallax drift={t.plateDrift} className="absolute inset-0">
            <NathiaImg name={scene.image.img} alt={scene.image.alt} sizes="(min-width: 900px) 34vw, 80vw" className="object-cover" />
          </Parallax>
        </ClipReveal>
        {/* [.mf-copy]: columns 7–12. */}
        <div className="col-span-6 col-start-7 max-[899px]:col-auto">
          <ScrubText
            text={scene.statement}
            dim={t.statementDim}
            stagger={t.statementStagger}
            start={t.statementStart}
            end={t.statementEnd}
            className="font-display text-[clamp(1.9rem,3vw,3.3rem)] leading-[1.14] font-medium tracking-[-0.005em]"
          />
          {scene.body && (
            <Reveal as="p" duration={t.bodyFade} at={t.bodyAt} className="mt-[6vh] max-w-[30em] text-[1.08rem] leading-[1.7] text-on-ink/86">
              {scene.body}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
