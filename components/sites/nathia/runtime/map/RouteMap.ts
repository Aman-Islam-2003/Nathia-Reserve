// The Address terrain map (three.js; this module is imported dynamically, only when the scene is near).
// Rebuilt from the live scene's behaviour [RouteMap], measured values in tokens.ts (addressMap):
// - terrain: the colour map, contour lines from the true height (100 m minor, 500 m major, fading with
//   distance), a warm glow travelling with the road's head, and height fog that turns toward the sun's colour;
//   a coarser far terrain (no contours, no glow) under the near one out to the horizon; a gradient sky.
// - the road from the airport, drawn up to the scene's progress with a hot head, plus a soft additive glow;
//   the Abbottabad side road draws near the end.
// - over the Reserve, a light beam and a pulsing ring (time-based).
// - the camera follows the road on a smoothed rail, looking ahead and toward the Reserve, then swings round it
//   over the last 16% of the road; the pointer tilts it slightly. It never goes below 260 m above the ground.
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  ImageBitmapLoader,
  LinearMipmapLinearFilter,
  Mesh,
  NoColorSpace,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Sphere,
  SphereGeometry,
  Texture,
  Vector3,
  WebGLRenderer,
  type Blending,
} from "three";
import { addressMap as M, addressTiming as T } from "../../tokens";
import { heightAt, rail, roadDrawn, type MapPlace, type MapRoute, type MeshArrays, type TerrainBuild } from "./terrain";

const EX = M.exaggeration;
const deg = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Angle a → b by t along the shorter way round. */
const mixAngle = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
};

// Terrain: colour map, per-pixel contours from the true height, the head's warm pool, sun-tinted height fog.
const terrainVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;
const terrainFragment = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uFog, uSunCol, uSun, uHead, uLine;
uniform float uFogK, uHeadGlow, uEx, uDim, uContours;
varying vec2 vUv;
varying vec3 vPos;
// 1 on an isoline of h every 'interval' metres, antialiased over about a pixel.
float isoline(float h, float interval) {
  float v = h / interval;
  float aa = fwidth(v);
  return 1.0 - clamp(abs(fract(v - 0.5) - 0.5) / max(aa * 1.1, 1e-4), 0.0, 1.0);
}
void main() {
  vec3 color = texture2D(uMap, vUv).rgb;
  float metres = vPos.y / uEx;
  float range = distance(cameraPosition, vPos);
  float minorLines = isoline(metres, 100.0) * (1.0 - smoothstep(9000.0, 42000.0, range));
  float majorLines = isoline(metres, 500.0) * (1.0 - smoothstep(20000.0, 90000.0, range));
  color = mix(color, uLine, (minorLines * 0.13 + majorLines * 0.3) * uContours);
  float toHead = distance(vPos.xz, uHead.xz);
  color += uSunCol * uHeadGlow * (exp(-toHead / 2600.0) * 0.22 + exp(-toHead / 600.0) * 0.25);
  color *= uDim;
  float fog = 1.0 - exp(-pow(range * uFogK, 1.32));
  float valleyHaze = smoothstep(1700.0, 500.0, metres) * 0.32;
  float sunward = pow(max(dot(normalize(vPos - cameraPosition), uSun), 0.0), 5.0);
  vec3 fogColor = mix(uFog, uSunCol, sunward * 0.55);
  gl_FragColor = vec4(mix(color, fogColor, clamp(fog * (1.0 + valleyHaze), 0.0, 1.0)), 1.0);
}`;

// Sky: horizon → zenith gradient with the sun's glow and disc, fading into the fog colour below the horizon.
const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = clip.xyww;
}`;
const skyFragment = /* glsl */ `
uniform vec3 uSun, uSunCol, uZen, uHor, uFog;
varying vec3 vDir;
void main() {
  vec3 dir = normalize(vDir);
  vec3 color = mix(uHor, uZen, smoothstep(-0.02, 0.5, dir.y));
  float sun = max(dot(dir, uSun), 0.0);
  color += uSunCol * (pow(sun, 7.0) * 0.5 + pow(sun, 120.0) * 0.9);
  gl_FragColor = vec4(mix(uFog, color, smoothstep(-0.12, 0.02, dir.y)), 1.0);
}`;

// Road: a tube of radius 1 pushed out along its normals by a fraction of the camera distance (constant width
// on screen); drawn up to uProgress, with a hot head that cools along the road.
const roadVertex = /* glsl */ `
uniform float uWidth;
varying float vAlong;
void main() {
  vAlong = uv.x;
  vec4 world = modelMatrix * vec4(position, 1.0);
  world.xyz += normalize(mat3(modelMatrix) * normal) * uWidth * distance(cameraPosition, world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}`;
const roadFragment = /* glsl */ `
uniform float uProgress, uAlpha, uHot;
uniform vec3 uA, uB;
varying float vAlong;
void main() {
  if (vAlong > uProgress) discard;
  float head = exp(-(uProgress - vAlong) * uHot);
  gl_FragColor = vec4(mix(uA, uB, head) * (1.0 + head * 0.9), uAlpha * (0.55 + 0.45 * head));
}`;

// Beam over the Reserve: a soft vertical shaft, brightest at the base, pulsing upward.
const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const beamFragment = /* glsl */ `
uniform float uTime, uAlpha;
uniform vec3 uCol;
varying vec2 vUv;
void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float shaft = exp(-x * x * 26.0) * 1.4 + exp(-x * 4.0) * 0.35;
  float pulse = 0.82 + 0.18 * sin(uTime * 2.2 - vUv.y * 9.0);
  gl_FragColor = vec4(uCol * shaft * pow(1.0 - vUv.y, 1.6) * pulse * uAlpha, 1.0);
}`;
// Ring on the ground at the Reserve: three ripples expanding and fading, over a bright centre.
const ringFragment = /* glsl */ `
uniform float uTime, uAlpha;
uniform vec3 uCol;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  float glow = smoothstep(0.12, 0.0, r) * 0.8;
  for (int i = 0; i < 3; i++) {
    float phase = fract(uTime * 0.32 + float(i) / 3.0);
    glow += smoothstep(0.06, 0.0, abs(r - phase)) * (1.0 - phase);
  }
  gl_FragColor = vec4(uCol * glow * uAlpha, 1.0);
}`;

interface Road {
  core: ShaderMaterial;
  glow: ShaderMaterial;
  route: MapRoute;
}

interface Shot {
  target: Vector3;
  r: number;
  az: number;
  el: number;
}

type Rail = ReturnType<typeof rail>;

export interface MapAnchor {
  id: string;
  world: Vector3;
}

export interface RouteMapData {
  terrain: TerrainBuild;
  places: MapPlace[];
  high: boolean;
  colorUrl: string;
  farColorUrl: string;
}

const tmpA = new Vector3();
const tmpB = new Vector3();
const lift = new Vector3();

export class RouteMap {
  readonly anchors: MapAnchor[] = [];
  /** Elevation (m) of the road's head: the read-out under the map. */
  headElevation = 0;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private scene = new Scene();
  private data: RouteMapData;
  private terrain!: ShaderMaterial;
  private roads: Road[] = [];
  private beam!: Mesh;
  private beamMat!: ShaderMaterial;
  private ring!: Mesh;
  private ringMat!: ShaderMaterial;
  private sky!: Mesh;
  private site!: Vector3;
  private heading!: Rail;
  private aim!: Rail;
  /** Rail position after which the camera stops turning toward the Reserve (within 7 km of it). */
  private holdAt = 1;
  private head = new Vector3();
  private curve?: CatmullRomCurve3;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private rig: Shot | null = null;
  private progress = 0;
  private start = performance.now();
  private lastTime = 0;
  private disposed = false;
  /** Set when build() has finished: nothing renders before. */
  private built = false;

  constructor(canvas: HTMLCanvasElement, data: RouteMapData) {
    this.data = data;
    const { high } = data;
    this.renderer = new WebGLRenderer({ canvas, antialias: high, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? M.dpr.high : M.dpr.mid));
    this.camera = new PerspectiveCamera(high ? M.fov.high : M.fov.mid, 1, 50, 600000);
  }

  /** Lets the browser handle input and paint between build steps; false once disposed (stop building). */
  private async step() {
    const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    await (s?.yield ? s.yield() : new Promise((r) => setTimeout(r, 0)));
    return !this.disposed;
  }

  /**
   * Builds the scene in steps, each a short task (the whole build in one task measured ~350 ms at 4x CPU while
   * the visitor scrolls toward the scene), then compiles the shaders without blocking where the GPU allows
   * (KHR_parallel_shader_compile). Resolves false if disposed meanwhile. The colour map uploads in its own task
   * when it arrives, then the map renders once.
   */
  async build() {
    const { data } = this;
    const c = M.colors;
    const fog = new Color(c.fog);
    const sunColor = new Color(c.sun);
    const sun = new Vector3(...M.sunDir).normalize();

    // Colour maps decode off the main thread (ImageBitmap); flipped at decode as a TextureLoader texture would be.
    // No colour conversion at decode either: the maps are sampled as stored (NoColorSpace), as live.
    const loader = new ImageBitmapLoader().setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
    const texture = (url: string, done?: () => void) => {
      const t = new Texture();
      t.colorSpace = NoColorSpace;
      t.flipY = false;
      loader.load(url, (bitmap) => {
        if (this.disposed) return bitmap.close();
        t.image = bitmap;
        t.needsUpdate = true;
        done?.();
      });
      return t;
    };
    const color = texture(data.colorUrl, () => {
      this.renderer.initTexture(color);
      setTimeout(() => this.render(), 0);
    });
    color.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    color.minFilter = LinearMipmapLinearFilter;
    color.generateMipmaps = true;

    this.terrain = new ShaderMaterial({
      vertexShader: terrainVertex,
      fragmentShader: terrainFragment,
      uniforms: {
        uMap: { value: color },
        uFog: { value: fog },
        uSunCol: { value: sunColor },
        uSun: { value: sun },
        uHead: { value: new Vector3() },
        uHeadGlow: { value: 0 },
        uFogK: { value: M.fogDensity },
        uEx: { value: EX },
        uDim: { value: 1 },
        uContours: { value: 1 },
        uLine: { value: new Color(c.contour) },
      },
    });
    const { terrain } = data;
    this.scene.add(new Mesh(geometry(terrain.near), this.terrain));
    if (!(await this.step())) return false;
    const farMat = this.terrain.clone();
    farMat.uniforms.uMap = { value: texture(data.farColorUrl) };
    farMat.uniforms.uHeadGlow = { value: 0 };
    farMat.uniforms.uContours = { value: 0 };
    this.scene.add(new Mesh(geometry(terrain.far), farMat));

    this.sky = new Mesh(
      new SphereGeometry(1, 32, 16),
      new ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: BackSide,
        depthWrite: false,
        uniforms: { uSun: { value: sun }, uSunCol: { value: sunColor }, uZen: { value: new Color(c.zenith) }, uHor: { value: new Color(c.horizon) }, uFog: { value: fog } },
      }),
    );
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
    if (!(await this.step())) return false;

    const r = M.road;
    this.roads.push(this.road(data.terrain.roads.main, data.terrain.routes.airport, c.road, r.hot, r.width));
    if (!(await this.step())) return false;
    this.roads.push(this.road(data.terrain.roads.side, data.terrain.routes.abbottabad, c.sideRoad, r.sideHot, r.sideWidth));
    if (!(await this.step())) return false;
    this.heading = rail(data.terrain.routes.airport, M.rail.headingSigma, M.rail.step);
    this.aim = rail(data.terrain.routes.airport, M.rail.aimSigma, M.rail.step);
    for (let k = 0; k < this.heading.n; k++) {
      if (Math.hypot(this.heading.x[k], this.heading.z[k]) < M.rail.holdWithin) {
        this.holdAt = k / (this.heading.n - 1);
        break;
      }
    }

    this.site = new Vector3(0, this.ground(0, 0), 0);
    const quad = (fragmentShader: string, color: string) =>
      new ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 1 }, uCol: { value: new Color(color) } },
      });
    this.beamMat = quad(beamFragment, c.beam);
    this.beam = new Mesh(new PlaneGeometry(1, 1), this.beamMat);
    this.beam.renderOrder = 4;
    this.scene.add(this.beam);
    this.ringMat = quad(ringFragment, c.ring);
    this.ring = new Mesh(new PlaneGeometry(1, 1), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.copy(this.site).add(lift.set(0, 8, 0));
    this.ring.renderOrder = 4;
    this.scene.add(this.ring);

    for (const place of data.places) {
      this.anchors.push({ id: place.id, world: new Vector3(place.x, (heightAt(terrain.meta, terrain.n, terrain.heights, place.x, place.z) + M.pinLift) * EX, place.z) });
    }
    if (!(await this.step())) return false;
    await this.renderer.compileAsync(this.scene, this.camera);
    this.built = !this.disposed;
    return this.built;
  }

  /** Exaggerated ground height (scene units) at (x, z). */
  private ground(x: number, z: number) {
    const t = this.data.terrain;
    return heightAt(t.meta, t.n, t.heights, x, z) * EX;
  }

  /** A road from its tube (built in the worker, geometry.ts), with its two materials. */
  private road(arrays: MeshArrays, route: MapRoute, [a, b]: readonly [string, string], hot: number, width: number): Road {
    const tube = geometry(arrays);
    const material = (scale: number, alpha: number, blending: Blending) =>
      new ShaderMaterial({
        vertexShader: roadVertex,
        fragmentShader: roadFragment,
        transparent: true,
        depthWrite: false,
        blending,
        uniforms: { uWidth: { value: width * scale }, uProgress: { value: 0 }, uAlpha: { value: alpha }, uHot: { value: hot }, uA: { value: new Color(a) }, uB: { value: new Color(b) } },
      });
    const core = material(1, 1, NormalBlending);
    const glow = material(M.road.glowWidth, M.road.glowAlpha, AdditiveBlending);
    const coreMesh = new Mesh(tube, core);
    const glowMesh = new Mesh(tube, glow);
    coreMesh.renderOrder = 2;
    glowMesh.renderOrder = 3;
    this.scene.add(coreMesh, glowMesh);
    return { core, glow, route };
  }

  /**
   * The main road's centre line (the same curve the worker's tube follows), for the head's position: built on
   * first use, cheap (its arc-length table is computed on the first getPointAt).
   */
  private headCurve() {
    if (this.curve) return this.curve;
    const t = this.data.terrain;
    const points = t.routes.airport.points.map(([x, , z]) => new Vector3(x, (heightAt(t.meta, t.n, t.heights, x, z) + M.road.lift) * EX, z));
    this.curve = new CatmullRomCurve3(points, false, "centripetal");
    this.curve.arcLengthDivisions = Math.max(2000, points.length * 6);
    return this.curve;
  }

  setPointer(x: number, y: number) {
    this.pointer.tx = x;
    this.pointer.ty = y;
  }

  setProgress(p: number) {
    this.progress = p;
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Bearing from a point toward the Reserve (0 = north, clockwise). */
  private bearing(from: Vector3) {
    return Math.atan2(this.site.x - from.x, -(this.site.z - from.z));
  }

  private onRail(r: Rail, at: number, out: Vector3) {
    const f = clamp01(at) * (r.n - 1);
    const k = Math.min(r.n - 2, Math.floor(f));
    const t = f - k;
    const x = mix(r.x[k], r.x[k + 1], t);
    const z = mix(r.z[k], r.z[k + 1], t);
    return out.set(x, this.ground(x, z), z);
  }

  /** Where the camera wants to be at scene progress p: orbit target, distance, azimuth and elevation. */
  private shot(p: number): Shot {
    const wide = this.camera.aspect >= 1;
    const drawn = roadDrawn(p);
    // Behind the road's head, facing the Reserve (stops turning once within 7 km), offset 10° (3° on portrait).
    const facing = this.bearing(this.onRail(this.heading, Math.min(drawn, this.holdAt), tmpA));
    const at = this.onRail(this.heading, drawn, tmpA);
    const away = Math.hypot(at.x - this.site.x, at.z - this.site.z);
    const target = this.onRail(this.aim, drawn, tmpB).clone().lerp(this.site, wide ? 0.26 : 0.24);
    let r = Math.max((wide ? 0.9 : 1) * away, wide ? 7500 : 8000);
    let az = facing + Math.PI + deg(wide ? 10 : 3);
    let el = 14;
    // Over the last 16% of the road: settle on the Reserve and swing round to 150° (140° on portrait).
    const arrive = smooth(span(drawn, 0.84, 1));
    target.lerp(tmpA.copy(this.site).add(lift.set(0, 396, 0)), arrive);
    r = mix(r, wide ? 8500 : 10500, arrive);
    az = mixAngle(az, deg(wide ? 150 : 140), arrive) + deg(4) * span(p, 0.86, 1);
    el = mix(el, 19, arrive);
    if (p < T.routeStart) {
      // Before the road starts: from high above the airport, between it and the Reserve, into the first shot.
      const t = smooth(p / T.routeStart);
      const origin = this.onRail(this.aim, 0, tmpA).clone();
      const originAway = Math.hypot(origin.x - this.site.x, origin.z - this.site.z);
      return {
        target: origin.clone().lerp(this.site, 0.5).lerp(target, t),
        r: mix(0.9 * originAway, r, t),
        az: mixAngle(this.bearing(origin) + Math.PI, az, t),
        el: deg(mix(12, el, t)),
      };
    }
    return { target, r, az, el: deg(el) };
  }

  render() {
    if (this.disposed || !this.built) return;
    const p = this.progress;
    const time = (performance.now() - this.start) / 1000;
    const dt = Math.min(0.1, Math.max(0.001, time - this.lastTime));
    this.lastTime = time;
    const ptr = this.pointer;
    ptr.x += (ptr.tx - ptr.x) * M.pointerFollow;
    ptr.y += (ptr.ty - ptr.y) * M.pointerFollow;

    // The rig eases toward the shot (time constant .28 s), so scrubbing glides instead of jumping.
    const shot = this.shot(p);
    const rig = (this.rig ??= { target: shot.target.clone(), r: shot.r, az: shot.az, el: shot.el });
    const k = 1 - Math.exp(-dt / M.rigTime);
    rig.target.lerp(shot.target, k);
    rig.r += (shot.r - rig.r) * k;
    rig.az = mixAngle(rig.az, shot.az, k);
    rig.el += (shot.el - rig.el) * k;

    const az = rig.az + ptr.x * deg(M.pointerTilt.az);
    const el = rig.el + ptr.y * deg(M.pointerTilt.el);
    const cam = this.camera;
    cam.position.set(rig.target.x + Math.sin(az) * Math.cos(el) * rig.r, rig.target.y + Math.sin(el) * rig.r, rig.target.z - Math.cos(az) * Math.cos(el) * rig.r);
    const below = this.ground(cam.position.x, cam.position.z);
    if (cam.position.y < below + M.minClearance) cam.position.y = below + M.minClearance;
    cam.lookAt(rig.target);
    cam.near = Math.min(2500, Math.max(20, 0.18 * (cam.position.y - below)));
    cam.far = 520000;
    cam.updateProjectionMatrix();
    this.sky.position.copy(cam.position);
    this.sky.scale.setScalar(400000);

    const drawn = roadDrawn(p);
    const [main, side] = this.roads;
    main.core.uniforms.uProgress.value = main.glow.uniforms.uProgress.value = drawn;
    side.core.uniforms.uProgress.value = side.glow.uniforms.uProgress.value = smooth(span(p, 0.84, 0.95));
    this.headCurve().getPointAt(Math.min(1, drawn), this.head);
    const points = main.route.points;
    this.headElevation = points[Math.min(points.length - 1, Math.round(drawn * (points.length - 1)))][1];
    this.terrain.uniforms.uHead.value.copy(this.head);
    this.terrain.uniforms.uHeadGlow.value = span(p, 0.08, 0.14) * (1 - span(p, 0.8, 0.9));

    const range = cam.position.distanceTo(this.site);
    const tall = 0.17 * range;
    this.beam.scale.set(0.02 * range, tall, 1);
    this.beam.position.copy(this.site).add(lift.set(0, tall / 2, 0));
    this.beam.lookAt(cam.position.x, this.beam.position.y, cam.position.z);
    this.beamMat.uniforms.uTime.value = time;
    const ring = 0.07 * range;
    this.ring.scale.set(ring, ring, 1);
    this.ringMat.uniforms.uTime.value = time;
    this.ringMat.uniforms.uAlpha.value = 0.45 + 0.55 * span(p, 0.74, 0.86);

    this.renderer.render(this.scene, cam);
  }

  /** Screen position (px) of a world point and its distance from the camera; null behind the camera. */
  project(world: Vector3, width: number, height: number) {
    const v = tmpA.copy(world).project(this.camera);
    if (v.z > 1) return null;
    return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height, d: this.camera.position.distanceTo(world) };
  }

  /**
   * Frees the GPU resources, but keeps the context (no forceContextLoss): the canvas outlives this map (React's
   * dev double mount, a re-run across the mobile breakpoint), and a lost context handed back by getContext()
   * can't draw again. `lost`: the context is already gone (nothing to clear).
   */
  dispose(lost = false) {
    this.disposed = true;
    this.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.geometry.dispose();
      const m = o.material as ShaderMaterial;
      for (const u of Object.values(m.uniforms ?? {})) if (u.value instanceof Texture) u.value.dispose();
      m.dispose();
    });
    if (!lost) {
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.clear();
    }
    this.renderer.dispose();
  }
}

/** A mesh from the worker's arrays; its bounding sphere was computed there too (three.js's method). */
function geometry(g: MeshArrays) {
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(g.position, 3));
  if (g.normal) geo.setAttribute("normal", new BufferAttribute(g.normal, 3));
  geo.setAttribute("uv", new BufferAttribute(g.uv, 2));
  geo.setIndex(new BufferAttribute(g.index, 1));
  geo.boundingSphere = new Sphere(new Vector3(g.sphere[0], g.sphere[1], g.sphere[2]), g.sphere[3]);
  return geo;
}
