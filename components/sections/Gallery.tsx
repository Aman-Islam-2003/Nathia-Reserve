import Image from "next/image";
import { gallery } from "@/content/site";
import { Marquee } from "@/components/motion/Marquee";
import { SplitReveal } from "@/components/motion/SplitReveal";

export function Gallery() {
  return (
    <section id="gallery" className="gallery section" data-chapter>
      <p className="eyebrow">08 · First Look</p>
      <SplitReveal as="h2" className="h2">Inside <em>the Reserve.</em></SplitReveal>
      <Marquee label="gallery" speed={45}>
        {gallery.map((g) => (
          <figure key={g.img} className="gallery__item">
            <div className="gallery__media">
              <Image src={g.img} alt={`${g.caption} (placeholder)`} fill sizes="(min-width: 900px) 28vw, 70vw" />
            </div>
            <figcaption className="mono">{g.caption}</figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}
