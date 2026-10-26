// The Nathia logo as inline SVG paths (server only), for the preloader's stroke draw. Read from the asset in
// public/nathia/logo.svg at render time, so the artwork has a single source. Each path gets pathLength=1 so
// its stroke can be drawn from 0 to 1.
import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: { viewBox: string; transform: string; paths: string[] } | undefined;

function read() {
  const svg = readFileSync(join(process.cwd(), "public/nathia/logo.svg"), "utf8");
  return {
    viewBox: svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 6454 3418",
    transform: svg.match(/<g[^>]*transform="([^"]+)"/)?.[1] ?? "",
    paths: [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]),
  };
}

/** Width / height of the logo artwork. */
export const LOGO_ASPECT = 6454 / 3418;

export function LogoMark() {
  cached ??= read();
  return (
    <svg viewBox={cached.viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g transform={cached.transform}>
        {cached.paths.map((d, i) => (
          <path key={i} d={d} pathLength={1} />
        ))}
      </g>
    </svg>
  );
}
