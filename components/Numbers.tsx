import { numbers } from "@/content/site";
import { RollingNumber } from "@/components/RollingNumber";

export function Numbers() {
  return (
    <section className="section numbers">
      <p className="label">02 · In numbers</p>
      <ul className="numbers__grid">
        {numbers.map((n) => (
          <li key={n.label}>
            <RollingNumber value={n.value} decimals={n.decimals ?? 0} suffix={n.suffix} className="numbers__value" />
            <p className="label">{n.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
