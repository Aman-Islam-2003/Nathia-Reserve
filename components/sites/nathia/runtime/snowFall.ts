// The falling snow over the Snow scene (raw WebGL points; loaded with the Snow runtime, near the scene).
// Rebuilt from the live scene's behaviour, values in tokens.ts (snowFall): each flake has a start, a depth and
// a phase; nearer flakes are bigger, softer, fainter and faster, sway more and catch more wind.
import { snowFall as F } from "../tokens";

const f = (n: number) => n.toFixed(4);

// One vertex per flake: aFlake = (start x, start y, depth 0–1, sway phase).
const VERTEX = `
attribute vec4 aFlake;
uniform float uTime;
uniform float uWind;
uniform float uDpr;
varying float vDepth;
void main() {
  float depth = aFlake.z;
  float fall = fract(aFlake.y - uTime * mix(${f(F.speed[0])}, ${f(F.speed[1])}, depth));
  float sway = sin(uTime * (${f(F.sway.rate[0])} + depth * ${f(F.sway.rate[1])}) + aFlake.w) * (${f(F.sway.amount[0])} + depth * ${f(F.sway.amount[1])});
  float across = fract(aFlake.x + sway + uWind * (${f(F.wind[0])} + depth * ${f(F.wind[1])}) + 0.5) - 0.5;
  gl_Position = vec4(across * ${f(F.spread[0])}, fall * ${f(F.spread[1])} - ${f(F.spread[1] / 2)}, 0.0, 1.0);
  gl_PointSize = mix(${f(F.size[0])}, ${f(F.size[1])}, depth * depth) * uDpr;
  vDepth = depth;
}`;

const FRAGMENT = `
precision mediump float;
varying float vDepth;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.5 - mix(${f(F.soft[0])}, ${f(F.soft[1])}, vDepth), r) * mix(${f(F.alpha[0])}, ${f(F.alpha[1])}, vDepth);
  gl_FragColor = vec4(vec3(alpha), alpha);
}`;

export interface SnowFall {
  start(): void;
  stop(): void;
  /** Scroll velocity (px/s): a gust in the scroll's direction. */
  push(velocity: number): void;
  resize(): void;
  destroy(): void;
}

/** Snow on `canvas` with `count` flakes (at most snowFall.dprCap device pixels per CSS pixel); null without WebGL. */
export function createSnowFall(canvas: HTMLCanvasElement, count: number): SnowFall | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  // A context lost before (a GPU reset) can't draw: the caller hides the canvas instead.
  if (!gl || gl.isContextLost()) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // Depth mix: most flakes far, some mid, a few near.
  const flakes = new Float32Array(count * 4);
  const [far, mid] = F.depthMix;
  for (let i = 0; i < count; i++) {
    const band = Math.random();
    flakes[i * 4] = Math.random();
    flakes[i * 4 + 1] = Math.random();
    flakes[i * 4 + 2] = band < far ? F.depth.far * Math.random() : band < mid ? F.depth.far + F.depth.mid * Math.random() : F.depth.near + (1 - F.depth.near) * Math.random();
    flakes[i * 4 + 3] = Math.PI * 2 * Math.random();
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flakes, gl.STATIC_DRAW);
  const aFlake = gl.getAttribLocation(program, "aFlake");
  gl.enableVertexAttribArray(aFlake);
  gl.vertexAttribPointer(aFlake, 4, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const loc = { time: gl.getUniformLocation(program, "uTime"), wind: gl.getUniformLocation(program, "uWind"), dpr: gl.getUniformLocation(program, "uDpr") };

  const dpr = Math.min(window.devicePixelRatio || 1, F.dprCap);
  let frame = 0;
  let running = false;
  let last = performance.now();
  let time = 0;
  let wind = 0; // accumulated drift
  let gust = 0; // drift speed, easing toward the pointer's pull
  let pull = 0; // pointer offset from the centre, -0.5 → 0.5

  const resize = () => {
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform1f(loc.dpr, dpr);
  };
  const onPointer = (e: PointerEvent) => (pull = e.clientX / window.innerWidth - 0.5);
  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    gust += (F.pointer.reach * pull - gust) * F.pointer.ease;
    wind += gust * dt;
    gl.uniform1f(loc.time, time);
    gl.uniform1f(loc.wind, wind);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
    frame = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("pointermove", onPointer, { passive: true });
  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    push(velocity) {
      gust += F.push * velocity;
    },
    resize,
    // Frees what this created and clears the canvas, but keeps the context: the canvas outlives this
    // instance (React's dev double mount, a re-run across the mobile breakpoint), and a lost context handed
    // back by getContext() can't draw again (its canvas showed solid white).
    destroy() {
      this.stop();
      window.removeEventListener("pointermove", onPointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
  };
}
