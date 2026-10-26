// Address terrain worker: fetches the map metadata, routes and height grids, decodes them and builds every mesh
// off the main thread (the terrain is 513² = 263k vertices on "high"; the road tubes and bounding spheres use
// three.js's own code, geometry.ts), then transfers the arrays back.
import { boundingSphere, roadTube } from "./geometry";
import { buildFar, buildNear, decodeHeights, mapFiles, type MapMeta, type MapRoutes, type TerrainBuild } from "./terrain";

export interface TerrainRequest {
  high: boolean;
  exaggeration: number;
}

self.onmessage = async (e: MessageEvent<TerrainRequest>) => {
  const { high, exaggeration } = e.data;
  const files = mapFiles(high);
  try {
    const [meta, routes, heightBuf, farBuf] = await Promise.all([
      fetch("/nathia/map/meta.json").then((r) => r.json() as Promise<MapMeta>),
      fetch("/nathia/map/routes.json").then((r) => r.json() as Promise<MapRoutes>),
      fetch(files.height).then((r) => r.arrayBuffer()),
      fetch(files.far).then((r) => r.arrayBuffer()),
    ]);
    const heights = decodeHeights(heightBuf);
    const near = buildNear(meta, files.n, heights, exaggeration);
    const far = buildFar(meta, files.fn, decodeHeights(farBuf), exaggeration);
    const build: TerrainBuild = {
      meta,
      n: files.n,
      heights,
      routes: { airport: routes.airport, abbottabad: routes.abbottabad },
      near: { ...near, sphere: boundingSphere(near.position) },
      far: { ...far, sphere: boundingSphere(far.position) },
      roads: { main: roadTube(routes.airport, meta, files.n, heights), side: roadTube(routes.abbottabad, meta, files.n, heights) },
    };
    const meshes = [build.near, build.far, build.roads.main, build.roads.side];
    const transfer = [heights, ...meshes.flatMap((m) => [m.position, m.uv, m.index, ...(m.normal ? [m.normal] : [])])].map((a) => a.buffer as ArrayBuffer);
    (self as unknown as Worker).postMessage({ ok: true, build }, transfer);
  } catch (error) {
    (self as unknown as Worker).postMessage({ ok: false, error: String(error) });
  }
};
