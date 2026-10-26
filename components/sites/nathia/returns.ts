// The returns calculator's arithmetic, as live computes it [Returns, topYield]: the same expressions in the same
// order, so every figure and its rounding come out identical. Shared by the server (the "Up to" figure) and the
// client calculator.

export interface ReturnsInput {
  /** Starting price in crore ("3.9" → 3.9). */
  priceCrore: number;
  /** PKR a night. */
  rate: number;
  /** Share of the year let, in %. */
  occupancy: number;
  managementPct: number;
  /** The monthly instalment as a share of the price, in %. */
  instalmentPct: number;
}

export function returnsFor({ priceCrore, rate, occupancy, managementPct, instalmentPct }: ReturnsInput) {
  const price = 1e7 * priceCrore;
  const nights = (occupancy / 100) * 365;
  const gross = rate * nights;
  const fee = gross * (managementPct / 100);
  const net = gross - fee;
  const instalment = (instalmentPct / 100) * price;
  return {
    price,
    nights,
    gross,
    fee,
    net,
    monthly: net / 12,
    yieldPct: (net / price) * 100,
    payback: price / net,
    instalment,
    /** How many times the monthly net covers the instalment. */
    times: net / 12 / instalment,
  };
}

/** The best net yield across the residences at the planned rates and occupancy, rounded [topYield]. */
export function topYield(options: { priceCrore: number; rate: number }[], occupancy: number, managementPct: number) {
  let best = 0;
  for (const { priceCrore, rate } of options) {
    // Live's own expression for this figure (not returnsFor's order), so its rounding matches.
    best = Math.max(best, ((365 * rate * (occupancy / 100) * (1 - managementPct / 100)) / (1e7 * priceCrore)) * 100);
  }
  return Math.round(best);
}

/** "PKR 1.07 crore" */
export const crore = (pkr: number) => `PKR ${(pkr / 1e7).toFixed(2)} crore`;
/** "PKR 8.9 lakh" */
export const lakh = (pkr: number) => `PKR ${(pkr / 1e5).toFixed(1)} lakh`;
/** "70,000" */
export const whole = (n: number) => Math.round(n).toLocaleString("en-US");

/** Fills "{name}" placeholders in content text. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
