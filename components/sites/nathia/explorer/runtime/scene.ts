// The explorer's live 3D scene (three.js; imported dynamically by OrbitExplorer, so it loads only on this page).
// Placeholder towers are built from content footprints, one mesh per level, so a ray from the pointer names the
// tower and level it hits: no image files, and the tap targets are the geometry itself. Drag to turn, pinch or
// wheel to zoom (OrbitControls), "Play orbit" turns it slowly. Renders only when something changed.
// Later: load the architect's model (.glb) instead of building boxes, with its level meshes named "<tower>-<level>".
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { ExplorerTower } from "@/content/nathia/explorer";
import { prefersReducedMotion } from "@/lib/gsap";
import { deviceTier } from "../../runtime/tier";

export interface Hit {
  /** Tower slug. */
  tower: string;
  /** 0-based level from the ground. */
  level: number;
}

export interface Highlight {
  tower: string | null;
  level: number | null;
}

export interface ExplorerScene {
  /** The chosen tower/level (strong accent) and the level under the pointer or a hovered button (faint accent). */
  setHighlight(selected: Highlight, hover: Hit | null): void;
  play(on: boolean): void;
  /** Turns the view by `degrees` around the building (keyboard). */
  turn(degrees: number): void;
  destroy(): void;
}

const BAY = 4; // metres per facade bay
const PH_INSET = 0.7; // penthouse footprint as a share of the tower's
const SKY = "#dcdcd3";
const TARGET = new Vector3(-2, 20, 3);

/** One facade tile: four 4 m bays by one level. Cream slab band, timber fins, glass with timber balcony rails, some cream panels. */
function facadeTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  const glass = g.createLinearGradient(0, 0, 0, 128);
  glass.addColorStop(0, "#8c99a3");
  glass.addColorStop(1, "#2e3a42");
  g.fillStyle = glass;
  g.fillRect(0, 0, 512, 128);
  for (let b = 0; b < 4; b++) {
    const x = b * 128;
    if (b === 1 || b === 3) {
      g.fillStyle = b === 1 ? "#e6dfd0" : "#ddd4c2"; // solid cream panels
      g.fillRect(x, 0, 128, 128);
    } else {
      g.fillStyle = "#8a6646"; // balcony rail slats
      for (let s = x + 12; s < x + 124; s += 7) g.fillRect(s, 86, 3, 24);
      g.fillRect(x + 10, 84, 116, 3);
    }
    g.fillStyle = "#7a5a3c"; // timber fin
    g.fillRect(x, 0, 9, 128);
  }
  g.fillStyle = "#efe8da"; // slab band
  g.fillRect(0, 110, 512, 18);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

export function createExplorerScene(o: {
  canvas: HTMLCanvasElement;
  towers: ExplorerTower[];
  levelHeight: number;
  onHover: (hit: Hit | null) => void;
  onPick: (hit: Hit) => void;
  onPlayingChange: (playing: boolean) => void;
  onReady: () => void;
}): ExplorerScene {
  const { canvas, levelHeight: H } = o;
  const reduce = prefersReducedMotion();
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const tier = deviceTier(renderer.getContext());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === "high" ? 2 : 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = tier !== "low";
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  scene.background = new Color(SKY);
  scene.fog = new Fog(SKY, 160, 460);
  const pmrem = new PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.45;

  scene.add(new HemisphereLight("#e4ebf2", "#6b7458", 0.9));
  const sun = new DirectionalLight("#fff0d8", 2.4);
  sun.position.set(-70, 90, 55);
  sun.castShadow = renderer.shadowMap.enabled;
  sun.shadow.mapSize.set(tier === "high" ? 2048 : 1024, tier === "high" ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 300 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // ---- ground and pines ----
  const disposables: { dispose(): void }[] = [envMap, pmrem];
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);
  const ground = new Mesh(track(new PlaneGeometry(900, 900)), track(new MeshStandardMaterial({ color: "#7c8868", roughness: 1 })));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const pines = new InstancedMesh(track(new ConeGeometry(2.4, 11, 7)), track(new MeshStandardMaterial({ color: "#2f4030", roughness: 0.9 })), 160);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const m = new Matrix4();
  for (let i = 0; i < pines.count; i++) {
    const a = rand() * Math.PI * 2;
    const r = 55 + rand() ** 0.7 * 140;
    const s = 0.7 + rand() * 0.8;
    m.makeScale(s, s, s).setPosition(Math.cos(a) * r, 5.5 * s, Math.sin(a) * r);
    pines.setMatrixAt(i, m);
  }
  pines.castShadow = renderer.shadowMap.enabled;
  scene.add(pines);

  // ---- towers: one mesh per level ----
  const facade = track(facadeTexture());
  const cream = track(new MeshStandardMaterial({ color: "#e9e2d3", roughness: 0.85 }));
  const facadeMaterial = (width: number) => {
    const map = track(facade.clone());
    map.repeat.set(width / (BAY * 4), 1);
    return track(new MeshStandardMaterial({ map, roughness: 0.55, metalness: 0.05 }));
  };
  /** Box materials in BoxGeometry's face order: +x, -x, +y, -y, +z, -z. */
  const levelMaterials = (w: number, d: number): Material[] => {
    const side = facadeMaterial(d);
    const front = facadeMaterial(w);
    return [side, side, cream, cream, front, front];
  };

  const levels: Mesh[] = [];
  const bounds = new Map<string, { w: number; d: number; x: number; z: number }>();
  for (const t of o.towers) {
    const { x, z, w, d } = t.footprint;
    bounds.set(t.slug, t.footprint);
    const body = levelMaterials(w, d);
    const top = levelMaterials(w * PH_INSET, d * PH_INSET);
    for (let i = 0; i < t.levels; i++) {
      const ph = i === t.levels - 1;
      const geo = track(new BoxGeometry(ph ? w * PH_INSET : w, H, ph ? d * PH_INSET : d));
      const mesh = new Mesh(geo, ph ? top : body);
      mesh.position.set(x, i * H + H / 2, z);
      mesh.castShadow = mesh.receiveShadow = renderer.shadowMap.enabled;
      mesh.userData = { tower: t.slug, level: i } satisfies Hit;
      levels.push(mesh);
      scene.add(mesh);
    }
    // Roof caps over the main stack and the penthouse.
    for (const [cw, cd, cy] of [[w + 0.6, d + 0.6, (t.levels - 1) * H], [w * PH_INSET + 0.6, d * PH_INSET + 0.6, t.levels * H]]) {
      const cap = new Mesh(track(new BoxGeometry(cw, 0.5, cd)), cream);
      cap.position.set(x, cy + 0.25, z);
      cap.castShadow = renderer.shadowMap.enabled;
      scene.add(cap);
    }
  }

  // ---- highlight boxes: slightly larger than the level, drawn over it ----
  const accent = getComputedStyle(canvas).getPropertyValue("--theme-accent").trim() || "#c3a78e";
  const overlay = (color: string) => {
    const mesh = new Mesh(track(new BoxGeometry(1, 1, 1)), track(new MeshBasicMaterial({ color, transparent: true, depthWrite: false })));
    mesh.visible = false;
    mesh.renderOrder = 1;
    scene.add(mesh);
    return mesh;
  };
  const selectedBox = overlay(accent);
  const hoverBox = overlay(accent);
  /** Fits `box` over a level (or the whole tower when `level` is null). */
  const place = (box: Mesh, tower: ExplorerTower, level: number | null, opacity: number) => {
    const f = bounds.get(tower.slug)!;
    const ph = level === tower.levels - 1;
    const k = ph ? PH_INSET : 1;
    const height = level === null ? (tower.levels - 1) * H : H;
    box.scale.set(f.w * k + 0.5, height + 0.1, f.d * k + 0.5);
    box.position.set(f.x, level === null ? height / 2 : level * H + H / 2, f.z);
    (box.material as MeshBasicMaterial).opacity = opacity;
    box.visible = true;
  };

  // ---- camera and controls ----
  const camera = new PerspectiveCamera(35, 1, 1, 1200);
  camera.position.set(TARGET.x + 95, 48, TARGET.z + 100);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(TARGET);
  controls.enablePan = false;
  controls.enableDamping = !reduce;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.6;
  controls.minDistance = 60;
  controls.maxDistance = 240;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.42; // never below the ground
  controls.autoRotateSpeed = 1.2; // ~50 s a turn
  controls.update();

  let dirty = true;
  let ready = false;
  const render = () => {
    const moved = controls.update();
    if (hoverAt) pickHover();
    if (!moved && !dirty) return;
    dirty = false;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      o.onReady();
    }
  };
  renderer.setAnimationLoop(render);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 52 : 35; // portrait: wider, so both towers fit
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---- picking ----
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const hitAt = (clientX: number, clientY: number): Hit | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(levels, false)[0];
    return hit ? (hit.object.userData as Hit) : null;
  };

  let selected: Highlight = { tower: null, level: null };
  let hover: Hit | null = null;
  const same = (a: Hit | null, b: Hit | null) => a === b || (!!a && !!b && a.tower === b.tower && a.level === b.level);
  const applyHighlight = () => {
    const sel = o.towers.find((t) => t.slug === selected.tower);
    if (sel) place(selectedBox, sel, selected.level, selected.level === null ? 0.28 : 0.72);
    else selectedBox.visible = false;
    const onSelected = hover && hover.tower === selected.tower && hover.level === selected.level;
    const hov = hover && !onSelected ? o.towers.find((t) => t.slug === hover!.tower) : null;
    if (hov && hover) place(hoverBox, hov, hover.level, 0.38);
    else hoverBox.visible = false;
    canvas.style.cursor = hover ? "pointer" : "grab";
    dirty = true;
  };

  // Hover is read once per frame from the last mouse position (no raycast per pointer event).
  let hoverAt: { x: number; y: number } | null = null;
  function pickHover() {
    const at = hoverAt!;
    hoverAt = null;
    const hit = hitAt(at.x, at.y);
    if (same(hit, hover)) return;
    hover = hit;
    o.onHover(hit);
    applyHighlight();
  }

  let down: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && !e.buttons) hoverAt = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (!down) return;
    const tap = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6;
    down = null;
    if (!tap) return;
    const hit = hitAt(e.clientX, e.clientY);
    if (hit) o.onPick(hit);
  };
  const onLeave = () => {
    hoverAt = null;
    if (!hover) return;
    hover = null;
    o.onHover(null);
    applyHighlight();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointerleave", onLeave);

  // ---- play ----
  let playing = false;
  function play(on: boolean) {
    if (playing === on) return;
    playing = on;
    controls.autoRotate = on;
    o.onPlayingChange(on);
  }
  controls.addEventListener("start", () => play(false)); // any drag or zoom stops the orbit
  if (!reduce) play(true); // a slow first turn; never with reduced motion

  const axis = new Vector3(0, 1, 0);
  return {
    setHighlight(sel, hov) {
      selected = sel;
      hover = hov;
      applyHighlight();
    },
    play,
    turn(degrees) {
      play(false);
      camera.position.sub(controls.target).applyAxisAngle(axis, (degrees * Math.PI) / 180).add(controls.target);
      dirty = true;
    },
    destroy() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
