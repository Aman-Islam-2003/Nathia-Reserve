import { numbers } from "@/content/site";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { SplitReveal } from "@/components/motion/SplitReveal";

export function Numbers() {
  return (
    <section id="numbers" className="numbers section" data-chapter>
      <p className="eyebrow">03 · The Measure</p>
      <SplitReveal as="h2" className="h2">Four numbers that <em>set it apart.</em></SplitReveal>
      <ol className="numbers__grid">
        {numbers.map((n, i) => (
          <li key={n.label} className="numbers__item">
            <span className="mono numbers__idx">{String(i + 1).padStart(2, "0")} / {String(numbers.length).padStart(2, "0")}</span>
            <RollingNumber value={n.value} decimals={n.decimals ?? 0} suffix={n.suffix} className="numbers__value" />
            <h3 className="numbers__label">{n.label}</h3>
            <p className="numbers__note">{n.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
