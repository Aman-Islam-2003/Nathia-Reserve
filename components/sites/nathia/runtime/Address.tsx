"use client";

import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { whenNear } from "@/components/motion/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import { addressMap, addressTiming as t } from "../tokens";
import type { RouteMap } from "./map/RouteMap";
import { buildFar, buildNear, decodeHeights, mapFiles, placeReached, type MapMeta, type MapPlace, type MapRoutes, type TerrainBuild } from "./map/terrain";
import { deviceTier } from "./tier";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const json = <T,>(url: string) => fetch(url).then((r) => r.json() as Promise<T>);

/** Terrain meshes from the worker (off the main thread); built here if a worker can't start. */
function buildTerrain(high: boolean): Promise<TerrainBuild> {
  const ex = addressMap.exaggeration;
  try {
    const worker = new Worker(new URL("./map/terrain.worker.ts", import.meta.url), { type: "module" });
    return new Promise<TerrainBuild>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<{ ok: boolean; build?: TerrainBuild; error?: string }>) => {
        worker.terminate();
        if (e.data.ok && e.data.build) resolve(e.data.build);
        else reject(new Error(e.data.error));
      };
      worker.onerror = (e) => {
        worker.terminate();
        reject(e);
      };
      worker.postMessage({ high, exaggeration: ex });
    });
  } catch {
    // Same build on the main thread (geometry.ts brings three.js, so it is imported only here).
    const f = mapFiles(high);
    return Promise.all([
      import("./map/geometry"),
      json<MapMeta>("/nathia/map/meta.json"),
      json<MapRoutes>("/nathia/map/routes.json"),
      fetch(f.height).then((r) => r.arrayBuffer()),
      fetch(f.far).then((r) => r.arrayBuffer()),
    ]).then(([{ boundingSphere, roadTube }, meta, routes, h, farBuf]) => {
      const heights = decodeHeights(h);
      const near = buildNear(meta, f.n, heights, ex);
      const far = buildFar(meta, f.fn, decodeHeights(farBuf), ex);
      return {
        meta,
        n: f.n,
        heights,
        routes,
        near: { ...near, sphere: boundingSphere(near.position) },
        far: { ...far, sphere: boundingSphere(far.position) },
        roads: { main: roadTube(routes.airport, meta, f.n, heights), side: roadTube(routes.abbottabad, meta, f.n, heights) },
      };
    });
  }
}

/**
 * The Address scene (loaded four viewports ahead), measured on live [Address]:
 * - the map: on "mid"/"high" tier devices (runtime/tier.ts, as live), the terrain is fetched and built in a
 *   worker and three.js is imported; the canvas fades in over the poster. "low" keeps the poster (no pins, the
 *   elevation stays at the airport's). A lost GPU context fades back to the poster.
 * - one scrubbed timeline (scrub .9) over the pin, set up when near: intro in, the switch to the distances
 *   panel at .07, rows lit as the road reaches each place, the closing heading at .9 (tokens: addressTiming).
 * - while the pin is active, a rAF loop renders the map at the timeline's progress, places the pins and writes
 *   the head's elevation (ft, to 50).
 * Reduced motion: nothing runs (the markup's static layout and poster).
 */
export default function AddressMotion({ sceneId }: { sceneId: string }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const s = document.getElementById(sceneId);
      if (!s) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        const stage = s.querySelector<HTMLElement>("[data-pinned]") ?? s;
        const canvas = s.querySelector<HTMLCanvasElement>("[data-ad-canvas]")!;
        const elevation = s.querySelector<HTMLElement>("[data-ad-elev-num]");
        const rows = gsap.utils.toArray<HTMLElement>("[data-ad-row]", s);
        const pins = new Map(gsap.utils.toArray<HTMLElement>("[data-ad-pin]", s).map((p) => [p.dataset.adPin!, p]));
        let map: RouteMap | null = null;
        /** The map while it builds (not rendered until ready). */
        let building: RouteMap | null = null;
        let progress = 0;
        let active = false;
        let raf = 0;
        let dead = false;
        let width = 0;
        let height = 0;

        const size = () => {
          width = stage.clientWidth;
          height = stage.clientHeight;
          map?.resize(width, height);
        };

        // Pins follow their place on screen: lit ones bright, the rest dim, both fading with distance; the
        // Reserve's appears as the road starts, the others go as the camera swings round it.
        const placePins = (m: RouteMap) => {
          for (const anchor of m.anchors) {
            const pin = pins.get(anchor.id);
            if (!pin) continue;
            const at = m.project(anchor.world, width, height);
            if (!at || at.x < -80 || at.x > width + 80 || at.y < -40 || at.y > height + 40) {
              pin.style.opacity = "0";
              continue;
            }
            const reserve = anchor.id === "reserve";
            const lit = reserve || placeReached(anchor.id, progress);
            const far = clamp01((at.d - 9000) / 60000);
            const shown = reserve ? clamp01((progress - 0.075) / 0.03) : 1 - clamp01((progress - 0.82) / 0.05);
            const strength = reserve ? 1 : lit ? 1 - 0.55 * far : 0.32 - 0.2 * far;
            pin.style.opacity = String(Math.max(0, strength * shown));
            pin.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
            pin.toggleAttribute("data-on", lit);
          }
        };

        const frame = () => {
          raf = 0;
          if (!map || !active) return;
          map.setProgress(progress);
          map.render();
          placePins(map);
          if (elevation) elevation.textContent = Math.max(0, Math.round((3.28084 * map.headElevation) / 50) * 50).toLocaleString("en-US");
          raf = requestAnimationFrame(frame);
        };
        const run = () => {
          if (!raf && map) raf = requestAnimationFrame(frame);
        };

        // The map, four viewports ahead (this runtime mounts that early): capable devices only, as live.
        const tier = deviceTier();
        const onLost = () => {
          // The GPU dropped the context (or the page disposed it): back to the poster, for good.
          building?.dispose(true);
          building = null;
          if (!map) return;
          cancelAnimationFrame(raf);
          raf = 0;
          delete canvas.dataset.live;
          pins.forEach((p) => (p.style.opacity = "0"));
          const lost = map;
          map = null;
          if (!dead) lost.dispose(true);
        };
        canvas.addEventListener("webglcontextlost", onLost);
        if (tier !== "low") {
          const high = tier === "high";
          const files = mapFiles(high);
          Promise.all([import("./map/RouteMap"), json<MapPlace[]>("/nathia/map/places.json"), buildTerrain(high)])
            .then(async ([{ RouteMap }, places, terrain]) => {
              if (dead) return;
              building = new RouteMap(canvas, { terrain, places, high, colorUrl: files.color, farColorUrl: files.farColor });
              // Built in short steps (scrolling stays smooth); shown once ready, as live shows its canvas.
              const ready = await building.build();
              if (!ready || dead) return;
              map = building;
              building = null;
              size();
              canvas.dataset.live = "";
              if (active) run();
            })
            .catch(() => {
              // No map (network or GPU failure): the poster stays.
            });
        }

        const onPointer = (e: PointerEvent) => map?.setPointer(e.clientX / window.innerWidth - 0.5, 0.5 - e.clientY / window.innerHeight);
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("resize", size);

        // The timeline, set up when the scene is about a viewport away.
        const init = ctx.add("init", () => {
          const q = (sel: string) => s.querySelector<HTMLElement>(sel)!;
          // Every heading line starts below its mask, as live shows them: a staggered fromTo renders its start
          // state only for the first line until the playhead reaches the others.
          gsap.set(s.querySelectorAll("[data-ad-head]"), { y: 0, yPercent: t.head.yPercent });
          gsap.set(s.querySelectorAll("[data-ad-closing]"), { y: 0, yPercent: t.closing.yPercent });
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: s,
              start: "top top",
              // The scene root is the pin track: top top → bottom bottom is the pinned range.
              end: "bottom bottom",
              scrub: t.scrub,
              invalidateOnRefresh: true,
              // A refresh (resize, fonts, layout) invalidates the timeline, which renders its start for a moment;
              // the last update would leave the rows and the map there until the next scroll. Re-read it.
              onRefresh: (self) => {
                tl.progress(self.progress);
                sync();
              },
              onToggle: (self) => {
                active = self.isActive;
                if (active) run();
              },
            },
            onUpdate: () => sync(),
          });
          // The scene's progress (map, pins, rows) follows the timeline's.
          function sync() {
            progress = tl.progress();
            rows.forEach((r) => r.toggleAttribute("data-on", placeReached(r.dataset.adRow!, progress)));
            if (active) run();
          }
          tl.to({}, { duration: 1 }, 0); // the timeline spans exactly 0 → 1
          tl.fromTo(s.querySelectorAll("[data-ad-head]"), { y: 0, yPercent: t.head.yPercent }, { yPercent: 0, duration: t.head.duration, stagger: t.head.stagger, ease: "power3.out" }, t.head.at)
            .fromTo(q("[data-ad-body]"), { autoAlpha: 0, y: t.body.y }, { autoAlpha: 1, y: 0, duration: t.body.duration }, t.body.at)
            .to(q("[data-ad-intro]"), { autoAlpha: 0, y: t.introOut.y, duration: t.introOut.duration, ease: "power2.in" }, t.introOut.at)
            .fromTo(q("[data-ad-panel]"), { autoAlpha: 0, x: t.panelIn.x }, { autoAlpha: 1, x: 0, duration: t.panelIn.duration, ease: "power2.out" }, t.panelIn.at)
            .fromTo(q("[data-ad-elev]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: t.elevationIn.duration }, t.elevationIn.at)
            .to([q("[data-ad-panel]"), q("[data-ad-elev]")], { autoAlpha: 0, duration: t.panelOut.duration }, t.panelOut.at)
            .fromTo(s.querySelectorAll("[data-ad-closing]"), { y: 0, yPercent: t.closing.yPercent }, { yPercent: 0, duration: t.closing.duration, stagger: t.closing.stagger, ease: "power3.out" }, t.closing.at)
            .fromTo(q("[data-ad-note]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: t.note.duration }, t.note.at)
            .fromTo(q("[data-ad-shade]"), { opacity: t.shade.from }, { opacity: t.shade.open, duration: t.shade.openDuration }, t.shade.openAt)
            .to(q("[data-ad-shade]"), { opacity: t.shade.close, duration: t.shade.closeDuration }, t.shade.closeAt);
        });
        const stop = whenNear(s, () => init());

        return () => {
          dead = true;
          stop();
          cancelAnimationFrame(raf);
          window.removeEventListener("pointermove", onPointer);
          window.removeEventListener("resize", size);
          canvas.removeEventListener("webglcontextlost", onLost);
          delete canvas.dataset.live;
          map?.dispose();
          building?.dispose();
          map = building = null;
        };
      });
    },
    { dependencies: [sceneId, motion], revertOnUpdate: true },
  );

  return null;
}
