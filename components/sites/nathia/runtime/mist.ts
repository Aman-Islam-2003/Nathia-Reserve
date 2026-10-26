// The Ascent's mist: one full-screen WebGL pass (loaded after first paint, from the Ascent runtime only).
// Our own shader code, with the live mist's measured math (noise, octaves, layer scales and speeds, thresholds): layered, slowly billowing haze that falls
// away as you climb, turns from cool grey to golden-hour warmth, parts softly around the pointer, and lets
// low-sun light shafts through where there is haze to catch them. Drawn at a fraction of the canvas's CSS
// size (soft by nature, and cheap); the browser scales it up.
import { deviceTier } from "./tier";

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform float uTime;     // seconds
uniform float uDensity;  // 0 clear → 1 white-out
uniform float uClimb;    // grows as we climb; the layers drift down past the camera
uniform float uGlow;     // 0 cool valley haze → 1 golden hour
uniform float uLight;    // sun shafts
uniform float uAspect;
uniform vec2 uPointer;   // 0–1, y up; the mist thins around it
uniform vec2 uSun;
uniform vec3 uCool;
uniform vec3 uWarm;

// Measured on the live mist [.ascent-mist]: its hash, octave rotation and lacunarity, layer scales and speeds,
// thresholds and weights. Matching them matters: a looser re-creation came out visibly denser (2026-10-25).
float rand(vec2 c) {
  c = fract(c * vec2(123.34, 456.21));
  c += dot(c, c + 45.32);
  return fract(c.x * c.y);
}

float valueNoise(vec2 x) {
  vec2 cell = floor(x);
  vec2 f = fract(x);
  vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(mix(rand(cell), rand(cell + vec2(1.0, 0.0)), s.x), mix(rand(cell + vec2(0.0, 1.0)), rand(cell + vec2(1.0, 1.0)), s.x), s.y);
}

const mat2 TURN = mat2(0.8, 0.6, -0.6, 0.8);

// Five octaves for the banks and billows, three (a different stride) for the warp, wisps and shafts.
float octaves5(vec2 x) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * valueNoise(x);
    x = TURN * x * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return sum;
}

float octaves3(vec2 x) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += amp * valueNoise(x);
    x = TURN * x * 2.07 + vec2(4.1, 2.3);
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * uAspect, uv.y);
  float t = uTime * 0.016;

  // A slow warp field, then three layers at different scales and speeds: far banks, mid billows, near wisps.
  // Nearer layers move faster with the climb (parallax).
  vec2 warp = vec2(
    octaves3(p * 1.15 + vec2(t, uClimb * 0.32)),
    octaves3(p * 1.15 + vec2(5.2, 1.3) - vec2(t * 0.8, uClimb * 0.32))
  );
  float far = octaves5(p * 1.25 + warp * 1.35 + vec2(t * 0.6, uClimb * 0.55));
  float mid = octaves5(p * 2.3 + warp * 0.85 + vec2(-t * 1.25, uClimb * 1.25));
  float near = octaves3(p * 4.2 + warp * 0.45 + vec2(t * 2.1, uClimb * 2.35));
  float body = far * 0.52 + mid * 0.32 + near * 0.16;

  // The pointer parts the mist: a soft, wide opening.
  float opening = smoothstep(0.36, 0.0, length((uv - uPointer) * vec2(uAspect, 1.0)));

  // Density lowers the threshold the billows must clear, then adds an even veil on top.
  float edge = mix(0.86, -0.38, uDensity);
  float cover = smoothstep(edge, edge + 0.6, body - opening * 0.5);
  cover *= smoothstep(0.0, 0.07, uDensity);
  cover = clamp(cover + uDensity * uDensity * 0.34 - opening * 0.22, 0.0, 1.0);

  // Sun shafts: broad angular bands fanning down and across from the low sun, fading with distance,
  // brighter where the haze is thicker.
  vec2 toSun = (uv - uSun) * vec2(uAspect, 1.0);
  float dist = length(toSun);
  float angle = atan(toSun.y, toSun.x);
  float bands = octaves3(vec2(angle * 3.1 + t * 0.25, t * 0.5)) * 0.75 + octaves3(vec2(angle * 6.3 - t * 0.2, 3.7)) * 0.25;
  bands = smoothstep(0.42, 0.78, bands);
  float fan = smoothstep(-0.15, 0.7, dot(toSun / max(dist, 0.0001), normalize(vec2(1.0, -0.85))));
  float catchLight = 0.35 + 0.65 * clamp(cover + uDensity * 0.5, 0.0, 1.0);
  float shafts = bands * fan * exp(-dist * 1.45) * uLight * catchLight * 0.6;
  float glare = exp(-dist * 4.2) * uLight * 0.3;

  vec3 tint = mix(uCool, uWarm, clamp(uGlow + body * 0.28 * uGlow, 0.0, 1.0)) + (near - 0.5) * 0.05;
  vec3 sunlight = uWarm * (shafts + glare);
  float alpha = clamp(cover + (shafts * 0.5 + glare * 0.6) * (1.0 - cover), 0.0, 1.0);
  // Premultiplied output.
  gl_FragColor = vec4(min(tint * cover + sunlight, vec3(1.0)), alpha);
}`;

export type MistValues = { density: number; climb: number; glow: number; light: number };

export type Mist = {
  set(values: Partial<MistValues>): void;
  resize(): void;
  play(): void;
  pause(): void;
  destroy(): void;
};

/** Resolves once the program has finished compiling, without blocking the main thread where supported. */
function linked(gl: WebGLRenderingContext, program: WebGLProgram) {
  const parallel = gl.getExtension("KHR_parallel_shader_compile") as { COMPLETION_STATUS_KHR: number } | null;
  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (gl.isContextLost()) return resolve(false);
      // Asking for LINK_STATUS waits for the compiler; COMPLETION_STATUS_KHR only asks whether it's done.
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) return void requestAnimationFrame(check);
      resolve(Boolean(gl.getProgramParameter(program, gl.LINK_STATUS)));
    };
    check();
  });
}

/**
 * Starts the mist on `canvas`, drawn at `scale` × its CSS size. Resolves to null on a low-tier device (see
 * tier.ts), without WebGL, or when the shader doesn't compile; the canvas then stays transparent. One WebGL
 * context serves both the tier check and the mist. `colors`: cool and warm tints and the sun position.
 */
export async function createMist(
  canvas: HTMLCanvasElement,
  scale: number,
  colors: { cool: readonly number[]; warm: readonly number[]; sun: readonly number[] },
): Promise<Mist | null> {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
  // No mist on weak devices, without WebGL, or with a context lost before (a GPU reset). The context is never
  // lost on purpose here: the canvas outlives this instance (React's dev double mount, a re-run across the
  // mobile breakpoint), and a lost context handed back by getContext() can't draw again.
  if (!gl || gl.isContextLost() || deviceTier(gl) === "low") return null;

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
  if (!(await linked(gl, program))) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);

  // One triangle that covers the view.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = {
    time: u("uTime"),
    density: u("uDensity"),
    climb: u("uClimb"),
    glow: u("uGlow"),
    light: u("uLight"),
    aspect: u("uAspect"),
    pointer: u("uPointer"),
  };
  gl.uniform3f(u("uCool"), colors.cool[0], colors.cool[1], colors.cool[2]);
  gl.uniform3f(u("uWarm"), colors.warm[0], colors.warm[1], colors.warm[2]);
  gl.uniform2f(u("uSun"), colors.sun[0], colors.sun[1]);

  const values: MistValues = { density: 0.42, climb: 0, glow: 0, light: 0 };
  // The opening follows the pointer with a lag (3.5% of the way per frame), from the centre.
  const pointer = { x: 0.5, y: 0.5, toX: 0.5, toY: 0.5 };
  const onPointer = (e: PointerEvent) => {
    pointer.toX = e.clientX / window.innerWidth;
    pointer.toY = 1 - e.clientY / window.innerHeight;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let frame = 0;
  const draw = (now: number) => {
    frame = requestAnimationFrame(draw);
    pointer.x += (pointer.toX - pointer.x) * 0.035;
    pointer.y += (pointer.toY - pointer.y) * 0.035;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (values.density <= 0.002 && values.light <= 0.002) return;
    gl.uniform1f(loc.time, now / 1000);
    gl.uniform1f(loc.density, values.density);
    gl.uniform1f(loc.climb, values.climb);
    gl.uniform1f(loc.glow, values.glow);
    gl.uniform1f(loc.light, values.light);
    gl.uniform2f(loc.pointer, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    const w = Math.max(2, Math.round(canvas.clientWidth * scale));
    const h = Math.max(2, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform1f(loc.aspect, w / h);
  };
  resize();

  return {
    set: (next) => Object.assign(values, next),
    resize,
    play: () => {
      if (!frame) frame = requestAnimationFrame(draw);
    },
    pause: () => {
      cancelAnimationFrame(frame);
      frame = 0;
    },
    destroy: () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("pointermove", onPointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
  };
}
