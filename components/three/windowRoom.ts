import * as THREE from "three";

/**
 * Off-axis projection ("the screen is a window").
 * The room's walls meet the edges of the host element. Each frame the camera moves to the
 * viewer's head position and the frustum is skewed so the frame edges stay fixed.
 * Input here is mouse / touch drag; swap `setHead` for webcam face tracking (MediaPipe) later.
 */
export function mountWindowRoom(host: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.className = "inside__canvas";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0f0d);
  const camera = new THREE.PerspectiveCamera();
  const H = 1, D = 3.4;
  let W = 1.6;

  // ---------- procedural textures (swap for real renders / a GLB model) ----------
  const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t;
  };
  const speckle = (g: CanvasRenderingContext2D, w: number, h: number, n: number, r: () => number, a: number) => {
    for (let i = 0; i < n; i++) { g.fillStyle = r() > 0.5 ? `rgba(255,248,235,${a})` : `rgba(40,30,20,${a})`; const s = 1 + r() * 2.5; g.fillRect(r() * w, r() * h, s, s); }
  };
  const wallTex = tex(1024, 512, (g, w, h) => {
    const r = rng(7); g.fillStyle = "#b7a993"; g.fillRect(0, 0, w, h); speckle(g, w, h * 0.62, 9000, r, 0.08);
    const y0 = h * 0.62; g.fillStyle = "#2b2824"; g.fillRect(0, y0, w, h - y0);
    let y = y0 + 3;
    while (y < h) { const bh = 26 + r() * 22; let x = -r() * 60; while (x < w) { const bw = 50 + r() * 90, v = 70 + r() * 45; g.fillStyle = `rgb(${v + 8},${v + 2},${v - 6})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); x += bw; } y += bh; }
    g.fillStyle = "#3a2a1c"; g.fillRect(0, y0 - 6, w, 8);
  });
  const floorTex = tex(512, 1024, (g, w, h) => {
    const r = rng(11), pw = w / 7;
    for (let i = 0; i < 7; i++) { let y = -r() * 300; while (y < h) { const ph = 260 + r() * 220, v = r(); g.fillStyle = `rgb(${92 + v * 30},${62 + v * 20},${38 + v * 12})`; g.fillRect(i * pw, y, pw, ph); g.fillStyle = "rgba(15,9,5,0.8)"; g.fillRect(i * pw, y, pw, 2); y += ph; } g.fillStyle = "rgba(15,9,5,0.85)"; g.fillRect(i * pw, 0, 2, h); }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  const skyTex = tex(2048, 1024, (g, w, h) => {
    const r = rng(21); const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1b2a44"); sky.addColorStop(0.45, "#5d6f8c"); sky.addColorStop(0.62, "#e7a873"); sky.addColorStop(1, "#f3c98e");
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    [{ b: 0.56, a: 0.16, c: "#8d8aa0" }, { b: 0.62, a: 0.12, c: "#64677e" }, { b: 0.69, a: 0.1, c: "#3f4558" }, { b: 0.77, a: 0.08, c: "#233026" }].forEach((L, li) => {
      g.fillStyle = L.c; g.beginPath(); g.moveTo(0, h); let v = 0;
      for (let x = 0; x <= w; x += 8) { v += (r() - 0.5) * 5; v *= 0.96; g.lineTo(x, h * L.b - Math.sin((x / w) * Math.PI * (2 + li)) * h * L.a * 0.6 + v * 6); }
      g.lineTo(w, h); g.closePath(); g.fill();
    });
  });
  const pinesTex = tex(2048, 512, (g, w, h) => {
    const r = rng(33); g.fillStyle = "#101712";
    for (let i = 0; i < 70; i++) { const x = r() * w, ph = 140 + r() * 260, pw = ph * 0.32; g.beginPath(); g.moveTo(x, h - ph); g.lineTo(x + pw / 2, h); g.lineTo(x - pw / 2, h); g.closePath(); g.fill(); }
  });

  const mats = {
    wall: new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92 }),
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.75 }),
    ceil: new THREE.MeshStandardMaterial({ color: 0x2a1d13, roughness: 0.9 }),
    timber: new THREE.MeshStandardMaterial({ color: 0x3b2718, roughness: 0.7 }),
    plaster: new THREE.MeshStandardMaterial({ color: 0xb2a48d, roughness: 0.95 }),
    sky: new THREE.MeshBasicMaterial({ map: skyTex }),
    pines: new THREE.MeshBasicMaterial({ map: pinesTex, transparent: true }),
    bulb: new THREE.MeshBasicMaterial({ color: 0xffd9a0 }),
    shade: new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide }),
  };

  let room = new THREE.Group();
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return o; };

  function build() {
    scene.remove(room);
    room.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    room = new THREE.Group();
    const wallGeo = new THREE.PlaneGeometry(D, H);
    const l = new THREE.Mesh(wallGeo, mats.wall); l.rotation.y = Math.PI / 2; l.position.set(-W / 2, 0, -D / 2);
    const r = new THREE.Mesh(wallGeo, mats.wall); r.rotation.y = -Math.PI / 2; r.position.set(W / 2, 0, -D / 2);
    floorTex.repeat.set(Math.max(1, W / 0.9), D / 1.6);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mats.floor); f.rotation.x = -Math.PI / 2; f.position.set(0, -H / 2, -D / 2);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mats.ceil); c.rotation.x = Math.PI / 2; c.position.set(0, H / 2, -D / 2);
    room.add(l, r, f, c);
    for (let i = 1; i <= 7; i++) {
      const z = -i * (D / 8);
      room.add(box(0.035, H, 0.06, mats.timber, -W / 2 + 0.0175, 0, z), box(0.035, H, 0.06, mats.timber, W / 2 - 0.0175, 0, z), box(W, 0.045, 0.07, mats.timber, 0, H / 2 - 0.022, z));
    }
    const ow = Math.min(W * 0.62, 1.4), oh = 0.56, oy = 0.04;
    const shape = new THREE.Shape(); shape.moveTo(-W / 2, -H / 2); shape.lineTo(W / 2, -H / 2); shape.lineTo(W / 2, H / 2); shape.lineTo(-W / 2, H / 2); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(-ow / 2, oy - oh / 2); hole.lineTo(-ow / 2, oy + oh / 2); hole.lineTo(ow / 2, oy + oh / 2); hole.lineTo(ow / 2, oy - oh / 2); hole.closePath();
    shape.holes.push(hole);
    const end = new THREE.Mesh(new THREE.ShapeGeometry(shape), mats.plaster); end.position.z = -D; room.add(end);
    const fz = -D + 0.01;
    room.add(box(ow + 0.06, 0.03, 0.06, mats.timber, 0, oy + oh / 2 + 0.015, fz), box(ow + 0.12, 0.035, 0.12, mats.timber, 0, oy - oh / 2 - 0.0175, fz + 0.03),
      box(0.03, oh, 0.06, mats.timber, -ow / 2 - 0.015, oy, fz), box(0.03, oh, 0.06, mats.timber, ow / 2 + 0.015, oy, fz),
      box(0.018, oh, 0.04, mats.timber, -ow / 6, oy, fz), box(0.018, oh, 0.04, mats.timber, ow / 6, oy, fz));
    const pines = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), mats.pines); pines.position.set(0, -0.62, -D - 1.6);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), mats.sky); sky.position.set(0.6, 0.35, -D - 5);
    room.add(pines, sky);
    [0.22, 0.5, 0.78].forEach((t, i) => {
      const z = -D * t, x = (i - 1) * Math.min(W * 0.12, 0.18), drop = 0.16 + (i % 2) * 0.05;
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, drop, 6), mats.shade); cord.position.set(x, H / 2 - drop / 2, z);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.06, 24, 1, true), mats.shade); shade.position.set(x, H / 2 - drop - 0.02, z);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), mats.bulb); bulb.position.set(x, H / 2 - drop - 0.05, z);
      const light = new THREE.PointLight(0xffc98a, 0.9, 0, 2); light.position.copy(bulb.position);
      room.add(cord, shade, bulb, light);
    });
    const win = new THREE.PointLight(0xffd2a0, 1.6, 0, 2); win.position.set(0, oy, -D + 0.25);
    room.add(win, new THREE.HemisphereLight(0xcfd8e6, 0x2a1d13, 0.35));
    scene.add(room);
  }

  // ---------- viewer ----------
  const head = { x: 0, y: 0, z: 1.4 }, target = { x: 0, y: 0, z: 1.4 };
  let lastInput = -1e9;
  const setHead = (nx: number, ny: number) => { target.x = nx * W * 0.55; target.y = ny * H * 0.42; lastInput = performance.now(); };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    const r = host.getBoundingClientRect();
    setHead(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  };
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerdown", onMove);

  const applyCamera = () => {
    const near = 0.02, far = 40, s = near / head.z;
    camera.position.set(head.x, head.y, head.z);
    camera.quaternion.identity();
    camera.updateMatrixWorld(true);
    camera.projectionMatrix.makePerspective((-W / 2 - head.x) * s, (W / 2 - head.x) * s, (H / 2 - head.y) * s, (-H / 2 - head.y) * s, near, far);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  };

  const resize = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    W = (w / h) * H;
    build();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // pause rendering when off-screen
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(host);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!reduce && performance.now() - lastInput > 2500) {
      target.x = Math.sin(t * 0.35) * W * 0.38;
      target.y = Math.sin(t * 0.22 + 1.2) * H * 0.22;
    }
    const k = reduce ? 0.25 : 0.075;
    head.x += (target.x - head.x) * k; head.y += (target.y - head.y) * k; head.z += (target.z - head.z) * k;
    applyCamera();
    renderer.render(scene, camera);
  });

  return () => {
    renderer.setAnimationLoop(null);
    ro.disconnect(); io.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerdown", onMove);
    room.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    Object.values(mats).forEach((m) => { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose(); });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
