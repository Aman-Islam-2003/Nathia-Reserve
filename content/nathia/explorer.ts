// The 3D explorer (/nathia/explore): towers and levels. Prototype: the scene builds placeholder box towers from
// these footprints (components/sites/nathia/explorer/runtime/scene.ts). When the architect's model lands as a
// .glb, the footprints go and the level counts stay.
import { z } from "zod";
import { lazyParse } from "./schema";

const towerSchema = z.object({
  /** URL segment: /nathia/explore/<slug>. */
  slug: z.string().regex(/^[a-z]$/),
  name: z.string(),
  /** Levels from the ground up; the last is the set-back penthouse level. */
  levels: z.number().int().positive(),
  /** Placeholder footprint in metres: centre x/z on the site, width (x) and depth (z). */
  footprint: z.object({ x: z.number(), z: z.number(), w: z.number().positive(), d: z.number().positive() }),
});

const explorerSchema = z.object({
  title: z.string(),
  hint: z.string(),
  loading: z.string(),
  back: z.string(),
  play: z.string(),
  pause: z.string(),
  showHomes: z.string(),
  showHomesSoon: z.string(),
  penthouse: z.string(),
  level: z.string(),
  pickLevel: z.string(),
  towers: z.array(towerSchema).min(1),
  /** Metres per level. */
  levelHeight: z.number().positive(),
});

export type Explorer = z.output<typeof explorerSchema>;
export type ExplorerTower = z.output<typeof towerSchema>;

export const getExplorer = lazyParse(explorerSchema, {
  title: "Find your home",
  hint: "Drag to turn · pinch or scroll to zoom · tap a level",
  loading: "Preparing your view…",
  back: "The Nathia Reserve",
  play: "Play orbit",
  pause: "Pause orbit",
  showHomes: "Show homes",
  showHomesSoon: "Floor plans arrive in the next step of the prototype.",
  penthouse: "Penthouse",
  level: "Level",
  pickLevel: "Pick a level on the building or below.",
  towers: [
    { slug: "a", name: "Roadside tower", levels: 11, footprint: { x: -19, z: -2, w: 26, d: 16 } },
    { slug: "b", name: "Valley tower", levels: 13, footprint: { x: 15, z: 8, w: 22, d: 20 } },
  ],
  levelHeight: 3.4,
});

/** Level name: "Level 4", or the penthouse for the top level. `index` is 0-based from the ground. */
export const levelName = (content: Explorer, tower: ExplorerTower, index: number) =>
  index === tower.levels - 1 ? content.penthouse : `${content.level} ${index + 1}`;

/** Level URL segment: "4", or "ph" for the top level. */
export const levelSlug = (tower: ExplorerTower, index: number) => (index === tower.levels - 1 ? "ph" : String(index + 1));

export interface ExplorerSelection {
  tower: string | null;
  level: number | null;
}

/** /nathia/explore[/<tower>[/<level>]] → the selection, or null for a path that names nothing. */
export function parseExplorerPath(content: Explorer, path: string[]): ExplorerSelection | null {
  if (path.length === 0) return { tower: null, level: null };
  const tower = content.towers.find((t) => t.slug === path[0]);
  if (!tower || path.length > 2) return null;
  if (path.length === 1) return { tower: tower.slug, level: null };
  const level = path[1] === "ph" ? tower.levels - 1 : Number(path[1]) - 1;
  if (!Number.isInteger(level) || level < 0 || level >= tower.levels - (path[1] === "ph" ? 0 : 1)) return null;
  return { tower: tower.slug, level };
}

/** The URL for a selection. */
export function explorerPath(content: Explorer, sel: ExplorerSelection) {
  const tower = content.towers.find((t) => t.slug === sel.tower);
  if (!tower) return "/nathia/explore";
  if (sel.level === null) return `/nathia/explore/${tower.slug}`;
  return `/nathia/explore/${tower.slug}/${levelSlug(tower, sel.level)}`;
}
