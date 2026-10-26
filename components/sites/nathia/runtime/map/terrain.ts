// Address terrain data (public/nathia/map, see meta.json): the height grids, their warp, and the geometry
// built from them. Pure functions with no three.js, shared by the terrain worker and the renderer.
//
// Frame: x east, z south, y elevation, metres, origin at the Reserve. The near grid is warped so cells are
// dense around the Reserve and sparse at the edges: an axis value is ±L·(A·|t| + (1 − A)·t²) for t in −1…1.
import { addressTiming as T } from "../../tokens";

/** Share of the main road drawn at scene progress p: starts at .07, eases out over .73 [routeDrawn]. */
export function roadDrawn(p: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, (p - T.routeStart) / T.routeSpan)), T.routePower);
}

/** Whether a place's distance row (and pin) is lit at progress p: the road has reached it [ROUTE_AT]. */
export function placeReached(id: string, p: number) {
  if (id === "abbottabad") return p >= T.abbottabadAt;
  const at = (T.routeAt as Record<string, number>)[id] ?? 0;
  return roadDrawn(p) >= at - 0.005 && p >= T.routeStart;
}

export interface MapMeta {
  warp: { A: number; Lx_neg: number; Lx_pos: number; Lz_neg: number; Lz_pos: number };
  far: { x0: number; x1: number; z0: number; z1: number };
}

export interface MapRoute {
  /** [x, elevation m, z] per point. */
  points: [number, number, number][];
  /** Distance along the route at each point (m). */
  dist: number[];
}

export interface MapPlace {
  id: string;
  x: number;
  z: number;
}

/** A mesh's attributes as built by the worker, with its bounding sphere (centre x, y, z, radius). */
export interface MeshArrays {
  position: Float32Array;
  uv: Float32Array;
  normal?: Float32Array;
  index: Uint32Array | Uint16Array;
  sphere: [number, number, number, number];
}

export interface MapRoutes {
  airport: MapRoute;
  abbottabad: MapRoute;
}

/**
 * Built by the worker: the decoded near heights (for lookups), the routes, and every mesh ready to upload
 * (terrain near and far, the two road tubes).
 */
export interface TerrainBuild {
  meta: MapMeta;
  n: number;
  heights: Float32Array;
  routes: MapRoutes;
  near: MeshArrays;
  far: MeshArrays;
  roads: { main: MeshArrays; side: MeshArrays };
}

/** Grid sizes and texture files per tier: the full set on "high", half resolution on "mid" [loadMapData]. */
export function mapFiles(high: boolean) {
  const n = high ? 513 : 257;
  const fn = high ? 257 : 129;
  return {
    n,
    fn,
    height: `/nathia/map/height-${n}.bin`,
    far: `/nathia/map/far-${fn}.bin`,
    color: high ? "/nathia/map/color-2048.webp" : "/nathia/map/color-1024.webp",
    farColor: "/nathia/map/far-512.webp",
  };
}

/** Heights are stored as little-endian u16: (elevation m + 100) × 10. */
export function decodeHeights(buffer: ArrayBuffer) {
  const raw = new Uint16Array(buffer);
  const out = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw[i] / 10 - 100;
  return out;
}

/** The warped coordinate of each of `n` grid lines along one axis. */
export function warpAxis(n: number, a: number, neg: number, pos: number) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 2 - 1;
    const m = Math.abs(t);
    out[i] = (t < 0 ? -neg : pos) * (a * m + (1 - a) * m * m);
  }
  return out;
}

/** Inverse of the warp: a coordinate (m) → its grid position in −1…1 (clamped at the edges). */
export function unwarp(v: number, a: number, neg: number, pos: number) {
  const m = Math.min(1, Math.abs(v) / (v < 0 ? neg : pos));
  // Solve (1 − a)·u² + a·u − m = 0 for u ≥ 0.
  return Math.sign(v) * ((-a + Math.sqrt(a * a + 4 * (1 - a) * m)) / (2 * (1 - a)));
}

/** Ground elevation (m, not exaggerated) at (x, z), bilinear on the near grid. */
export function heightAt(meta: MapMeta, n: number, heights: Float32Array, x: number, z: number) {
  const w = meta.warp;
  const gx = ((unwarp(x, w.A, w.Lx_neg, w.Lx_pos) + 1) / 2) * (n - 1);
  const gz = ((unwarp(z, w.A, w.Lz_neg, w.Lz_pos) + 1) / 2) * (n - 1);
  const i = Math.max(0, Math.min(n - 2, Math.floor(gx)));
  const j = Math.max(0, Math.min(n - 2, Math.floor(gz)));
  const fx = Math.min(1, Math.max(0, gx - i));
  const fz = Math.min(1, Math.max(0, gz - j));
  const row = j * n;
  const top = heights[row + i] * (1 - fx) + heights[row + i + 1] * fx;
  const bottom = heights[row + n + i] * (1 - fx) + heights[row + n + i + 1] * fx;
  return top * (1 - fz) + bottom * fz;
}

/** Two triangles per grid cell. */
function gridIndex(n: number) {
  const index = new Uint32Array((n - 1) * (n - 1) * 6);
  let k = 0;
  for (let j = 0; j < n - 1; j++)
    for (let i = 0; i < n - 1; i++) {
      const a = j * n + i;
      const b = a + 1;
      const c = a + n;
      const d = c + 1;
      index[k++] = a;
      index[k++] = c;
      index[k++] = b;
      index[k++] = b;
      index[k++] = c;
      index[k++] = d;
    }
  return index;
}

/** UVs: u east, v north (the colour maps' rows run north → south). */
function gridUv(n: number) {
  const uv = new Float32Array(n * n * 2);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const p = (j * n + i) * 2;
      uv[p] = i / (n - 1);
      uv[p + 1] = 1 - j / (n - 1);
    }
  return uv;
}

/** The near terrain (warped grid), elevations × `ex`. */
export function buildNear(meta: MapMeta, n: number, heights: Float32Array, ex: number) {
  const w = meta.warp;
  const xs = warpAxis(n, w.A, w.Lx_neg, w.Lx_pos);
  const zs = warpAxis(n, w.A, w.Lz_neg, w.Lz_pos);
  const position = new Float32Array(n * n * 3);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const v = j * n + i;
      position[v * 3] = xs[i];
      position[v * 3 + 1] = heights[v] * ex;
      position[v * 3 + 2] = zs[j];
    }
  return { position, uv: gridUv(n), index: gridIndex(n) };
}

/**
 * The far terrain (regular grid around the near one). Where it lies under the near grid it is lowered (40 m
 * at the near grid's edge, easing to 2,240 m within 4 km inside it) so the near terrain always wins; outside
 * it, by 25 m.
 */
export function buildFar(meta: MapMeta, fn: number, far: Float32Array, ex: number) {
  const w = meta.warp;
  const f = meta.far;
  const position = new Float32Array(fn * fn * 3);
  for (let j = 0; j < fn; j++)
    for (let i = 0; i < fn; i++) {
      const v = j * fn + i;
      const x = f.x0 + (f.x1 - f.x0) * (i / (fn - 1));
      const z = f.z0 + (f.z1 - f.z0) * (j / (fn - 1));
      const inside = Math.min(x + w.Lx_neg, w.Lx_pos - x, z + w.Lz_neg, w.Lz_pos - z);
      const drop = inside > 0 ? 40 + 2200 * Math.min(1, inside / 4000) : 25;
      position[v * 3] = x;
      position[v * 3 + 1] = (far[v] - drop) * ex;
      position[v * 3 + 2] = z;
    }
  return { position, uv: gridUv(fn), index: gridIndex(fn) };
}

/**
 * A camera rail: the route's ground track resampled every `step` metres, then Gaussian-smoothed (σ `sigma`,
 * clamped at the ends), so the camera follows the road's general line, not its hairpins.
 */
export function rail(route: MapRoute, sigma: number, step: number) {
  const { dist, points } = route;
  const length = dist[dist.length - 1];
  const count = Math.ceil(length / step) + 1;
  const xs = new Float32Array(count);
  const zs = new Float32Array(count);
  let seg = 0;
  for (let k = 0; k < count; k++) {
    const at = (k / (count - 1)) * length;
    while (seg < dist.length - 2 && dist[seg + 1] < at) seg++;
    const span = dist[seg + 1] - dist[seg];
    const t = span > 0 ? Math.min(1, Math.max(0, (at - dist[seg]) / span)) : 0;
    xs[k] = points[seg][0] + (points[seg + 1][0] - points[seg][0]) * t;
    zs[k] = points[seg][2] + (points[seg + 1][2] - points[seg][2]) * t;
  }
  const reach = Math.ceil((3 * sigma) / step);
  const kernel = new Float32Array(2 * reach + 1);
  let total = 0;
  for (let o = -reach; o <= reach; o++) total += kernel[o + reach] = Math.exp(-0.5 * ((o * step) / sigma) ** 2);
  const x = new Float32Array(count);
  const z = new Float32Array(count);
  for (let k = 0; k < count; k++) {
    let sx = 0;
    let sz = 0;
    for (let o = -reach; o <= reach; o++) {
      const at = Math.min(count - 1, Math.max(0, k + o));
      sx += xs[at] * kernel[o + reach];
      sz += zs[at] * kernel[o + reach];
    }
    x[k] = sx / total;
    z[k] = sz / total;
  }
  return { x, z, n: count };
}
