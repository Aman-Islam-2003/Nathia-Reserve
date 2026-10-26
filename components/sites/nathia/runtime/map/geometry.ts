// Address map geometry built in the terrain worker with three.js's own classes (so it is exactly what the
// renderer would build), returned as plain arrays: the road tubes and every mesh's bounding sphere. Built on
// the main thread, the main road's tube and the near terrain's bounding sphere were each a 150–200 ms task at
// 4x CPU while the visitor scrolls toward the scene. Imported only by the worker.
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { addressMap as M } from "../../tokens";
import { heightAt, type MapMeta, type MapRoute, type MeshArrays } from "./terrain";

const sphereOf = (geo: BufferGeometry): MeshArrays["sphere"] => {
  geo.computeBoundingSphere();
  const s = geo.boundingSphere!;
  return [s.center.x, s.center.y, s.center.z, s.radius];
};

/** The bounding sphere three.js would compute for a mesh with these positions. */
export function boundingSphere(position: Float32Array) {
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(position, 3));
  return sphereOf(geo);
}

/**
 * A road as a tube of radius 1 along a centripetal Catmull-Rom curve through its points lifted 26 m above the
 * ground (the shader widens it with distance): 3 segments per point (at most 2,400), 6 around.
 */
export function roadTube(route: MapRoute, meta: MapMeta, n: number, heights: Float32Array): MeshArrays {
  const ex = M.exaggeration;
  const points = route.points.map(([x, , z]) => new Vector3(x, (heightAt(meta, n, heights, x, z) + M.road.lift) * ex, z));
  const curve = new CatmullRomCurve3(points, false, "centripetal");
  curve.arcLengthDivisions = Math.max(2000, points.length * 6);
  const tube = new TubeGeometry(curve, Math.min(2400, points.length * 3), 1, 6, false);
  const attr = (name: string) => tube.getAttribute(name).array as Float32Array;
  return { position: attr("position"), normal: attr("normal"), uv: attr("uv"), index: tube.getIndex()!.array as Uint32Array | Uint16Array, sphere: sphereOf(tube) };
}
