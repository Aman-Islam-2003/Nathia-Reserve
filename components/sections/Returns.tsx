"use client";

import { useMemo, useState } from "react";
import { returns } from "@/content/site";
import { SplitReveal } from "@/components/motion/SplitReveal";

const pkr = (n: number) => {
  if (n >= 10_000_000) return `PKR ${(n / 10_000_000).toFixed(2)} crore`;
  if (n >= 100_000) return `PKR ${(n / 100_000).toFixed(1)} lakh`;
  return `PKR ${Math.round(n).toLocaleString("en-US")}`;
};

/** Live yield calculator: pick a residence, move nightly rate and occupancy. */
export function Returns() {
  const [typeId, setTypeId] = useState(returns.types[0].id);
  const type = returns.types.find((t) => t.id === typeId)!;
  const [rate, setRate] = useState(type.rate);
  const [occ, setOcc] = useState(60);

  const r = useMemo(() => {
    const nights = Math.round((365 * occ) / 100);
    const gross = rate * nights;
    const fee = gross * returns.managementFee;
    const net = gross - fee;
    return { nights, gross, fee, net, monthly: net / 12, yieldPct: (net / type.price) * 100, payback: type.price / net };
  }, [rate, occ, type.price]);

  const pick = (id: string) => {
    const t = returns.types.find((x) => x.id === id)!;
    setTypeId(id);
    setRate(t.rate);
  };

  return (
    <section id="returns" className="returns section" data-chapter>
      <p className="eyebrow">09 · What it earns</p>
      <SplitReveal as="h2" className="h2">Not a second home. <em>A working asset.</em></SplitReveal>

      <div className="calc">
        <div className="calc__inputs">
          <fieldset className="calc__types">
            <legend className="label">Residence</legend>
            {returns.types.map((t) => (
              <label key={t.id} className={`chip ${t.id === typeId ? "is-on" : ""}`}>
                <input type="radio" name="type" value={t.id} checked={t.id === typeId} onChange={() => pick(t.id)} />
                {t.name}
              </label>
            ))}
          </fieldset>

          <label className="calc__range" htmlFor="rate">
            <span className="label">Nightly rate</span>
            <output className="calc__out">{pkr(rate)} a night</output>
            <input id="rate" type="range" min={Math.round(type.rate * 0.5)} max={Math.round(type.rate * 1.6)} step={5000} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>

          <label className="calc__range" htmlFor="occ">
            <span className="label">Occupancy across the year</span>
            <output className="calc__out">{occ}% · {r.nights} nights</output>
            <input id="occ" type="range" min={20} max={90} step={1} value={occ} onChange={(e) => setOcc(Number(e.target.value))} />
          </label>
        </div>

        <dl className="calc__table">
          <div><dt>Gross room income a year</dt><dd>{pkr(r.gross)}</dd></div>
          <div><dt>Hotel management ({returns.managementFee * 100}%)</dt><dd>− {pkr(r.fee)}</dd></div>
          <div className="calc__strong"><dt>Net to you a year</dt><dd>{pkr(r.net)}</dd></div>
          <div><dt>Net a month</dt><dd>{pkr(r.monthly)}</dd></div>
          <div><dt>Yield on starting price</dt><dd>{r.yieldPct.toFixed(1)}%</dd></div>
          <div><dt>Years to pay back</dt><dd>{r.payback.toFixed(1)}</dd></div>
        </dl>
      </div>
      <p className="fine">{returns.disclaimer}</p>
    </section>
  );
}
