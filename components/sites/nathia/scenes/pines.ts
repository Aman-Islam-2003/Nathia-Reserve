// Pine silhouettes for the Ascent's falling forest. Our own generator: a seeded, slightly irregular spruce
// outline (tiers of drooping branches narrowing to the tip, a short trunk) in a 100 × 108 box, drawn with
// preserveAspectRatio="none" so each pine stretches to its slot. The same seed always gives the same tree,
// so server and client render identical paths.

/** Deterministic pseudo-random numbers from a seed (mulberry32). */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** SVG path for one pine. `tiers` branch levels from the tip (y 0) to the base (y 100), trunk to y 108. */
export function pinePath(seed: number, tiers = 12) {
  const rand = seeded(seed);
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 1; i <= tiers; i++) {
    const y = (i / tiers) * 100;
    // Half-width grows towards the base, with some irregularity per tier.
    const half = 4 + (i / tiers) * 42 * (0.82 + 0.3 * rand());
    const droop = 2 + 3.5 * rand();
    // Each tier: out to the branch tip (drooping), back in towards the stem.
    left.push(`${r1(50 - half)},${r1(y + droop)}`, `${r1(50 - half * 0.4)},${r1(y + 1.2)}`);
    right.unshift(`${r1(50 + half * 0.4)},${r1(y + 1.2)}`, `${r1(50 + half)},${r1(y + droop)}`);
  }
  return `M50,0 L${left.join(" L")} L47.5,108 L52.5,108 L${right.join(" L")} Z`;
}

/** The six pines of the live scene: left edge %, width %, depth (0 far → 1 near), seed. */
export const ascentPines: { left: number; width: number; depth: number; seed: number }[] = [
  { left: -7, width: 27, depth: 1, seed: 3 },
  { left: 9, width: 15, depth: 0.55, seed: 11 },
  { left: 23, width: 9, depth: 0.25, seed: 7 },
  { left: 70, width: 10, depth: 0.3, seed: 19 },
  { left: 80, width: 18, depth: 0.6, seed: 5 },
  { left: 89, width: 29, depth: 1, seed: 23 },
];
