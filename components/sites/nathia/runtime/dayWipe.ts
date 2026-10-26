// The Day wipe (raw WebGL; loaded with the Day runtime, near the scene). Two photos at a time on one
// full-screen triangle: the next one is revealed where a per-pixel key falls under a moving threshold, with a
// warm glow along the front. Rebuilt from the live scene's behaviour, values in tokens.ts (dayWipe).
import { dayWipe as W } from "../tokens";

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const f = (n: number) => n.toFixed(4);
const [k0, k1, k2] = W.keys;
const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom, uTo;
uniform float uProgress;  // 0 → 1 through one wipe
uniform float uMode;      // 0: bottom up, 1: left to right, 2: darkest first
uniform float uTime;
uniform vec2 uScale, uShift;

float rand(vec2 c) {
  c = fract(c * vec2(123.34, 456.21));
  c += dot(c, c + 45.32);
  return fract(c.x * c.y);
}
float valueNoise(vec2 x) {
  vec2 cell = floor(x);
  vec2 fr = fract(x);
  vec2 s = fr * fr * (3.0 - 2.0 * fr);
  return mix(mix(rand(cell), rand(cell + vec2(1.0, 0.0)), s.x), mix(rand(cell + vec2(0.0, 1.0)), rand(cell + vec2(1.0, 1.0)), s.x), s.y);
}
float octaves(vec2 x) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * valueNoise(x);
    x *= 2.03;
    amp *= 0.5;
  }
  return sum;
}
float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  // Cover fit, with the overflow biased downward.
  vec2 uv = (vUv - 0.5) * uScale + 0.5 + uShift;
  vec3 from = texture2D(uFrom, uv).rgb;
  vec3 to = texture2D(uTo, uv).rgb;
  float grain = octaves(uv * vec2(${f(W.noise.scale[0])}, ${f(W.noise.scale[1])}) + uTime * ${f(W.noise.speed)});
  float dark = 1.0 - luminance(to);
  float key;
  if (uMode < 0.5) key = (1.0 - uv.y) * ${f(k0.axis)} + dark * ${f(k0.lum)} + grain * ${f(k0.noise)};
  else if (uMode < 1.5) key = uv.x * ${f(k1.axis)} + dark * ${f(k1.lum)} + grain * ${f(k1.noise)};
  else key = dark * ${f(k2.lum)} + grain * ${f(k2.noise)};
  float threshold = uProgress * ${f(W.threshold.scale)} - ${f(W.threshold.offset)};
  float keep = smoothstep(threshold - ${f(W.threshold.soft)}, threshold + ${f(W.threshold.soft)}, key);
  vec3 color = mix(to, from, keep);
  // The warm front, only while a wipe is under way.
  float front = 1.0 - abs(keep - 0.5) * 2.0;
  color += vec3(${W.glow.color.map(f).join(", ")}) * front * ${f(W.glow.strength)} * step(0.002, uProgress) * step(uProgress, 0.998);
  gl_FragColor = vec4(color, 1.0);
}`;

export interface DayWipe {
  /** Show wipe `from` → `from + 1` at `progress` (0–1). */
  set(from: number, progress: number): void;
  resize(): void;
  /** Resolves once every photo is on the GPU. */
  ready: Promise<void>;
  /** Approximate GPU memory for the photos and the canvas (bytes). */
  gpuBytes(): number;
  destroy(): void;
}

/** The wipe on `canvas` for `files` (in order), drawn at up to `dprCap` device pixels per CSS pixel; null without WebGL. */
export function createDayWipe(canvas: HTMLCanvasElement, files: string[], dprCap: number): DayWipe | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  // A context lost before (a GPU reset) can't draw: the caller falls back to the stills.
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
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = { progress: u("uProgress"), mode: u("uMode"), time: u("uTime"), scale: u("uScale"), shift: u("uShift") };
  gl.uniform1i(u("uFrom"), 0);
  gl.uniform1i(u("uTo"), 1);

  const textures: (WebGLTexture | null)[] = files.map(() => null);
  let imageW = 2400;
  let imageH = 1620;
  let textureBytes = 0;
  let from = 0;
  let progress = 0;
  let dead = false;
  const start = performance.now();

  const draw = () => {
    if (dead) return;
    const a = textures[from] ?? textures.find(Boolean) ?? null;
    const b = textures[Math.min(files.length - 1, from + 1)] ?? a;
    if (!a) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, b);
    gl.uniform1f(loc.progress, progress);
    gl.uniform1f(loc.mode, from);
    gl.uniform1f(loc.time, (performance.now() - start) / 1000);
    // Cover: the photo fills the canvas; when the canvas is wider, it's cropped top and bottom, 8% low.
    const canvasAspect = canvas.width / canvas.height;
    const photoAspect = imageW / imageH;
    const y = canvasAspect > photoAspect ? photoAspect / canvasAspect : 1;
    gl.uniform2f(loc.scale, canvasAspect > photoAspect ? 1 : canvasAspect / photoAspect, y);
    gl.uniform2f(loc.shift, 0, (1 - y) * W.focusShift);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    draw();
  };

  // Each photo: fetched and decoded off the main thread, then uploaded in horizontal strips, one task each (a
  // whole 2400 × 1620 upload was a 65–100 ms task at 4x CPU near the scene). Strips are cropped and flipped
  // for GL's bottom-up rows at decode, so the top strip lands at the top of the texture.
  const STRIPS = 4;
  const nextTask = () => new Promise((r) => setTimeout(r, 0));
  // One photo uploads at a time, so their strips don't pile into the same tasks.
  let queue: Promise<unknown> = Promise.resolve();
  const ready = Promise.all(
    files.map(async (file, i) => {
      try {
        const blob = await (await fetch(file)).blob();
        const whole = await createImageBitmap(blob);
        const width = whole.width;
        const height = whole.height;
        whole.close();
        const rows = Math.ceil(height / STRIPS);
        const strips = await Promise.all(
          Array.from({ length: STRIPS }, (_, k) => {
            const y = k * rows;
            return createImageBitmap(blob, 0, y, width, Math.min(rows, height - y), { imageOrientation: "flipY" });
          }),
        );
        const upload = queue.then(async () => {
          if (dead) return strips.forEach((s) => s.close());
          imageW = width;
          imageH = height;
          const texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          for (let k = 0; k < strips.length; k++) {
            await nextTask();
            if (dead) return strips.forEach((s) => s.close());
            const strip = strips[k];
            // Strip k (from the top of the photo) goes k strips down from the texture's top row.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, height - k * rows - strip.height, gl.RGB, gl.UNSIGNED_BYTE, strip);
            strip.close();
          }
          // RGB is usually stored as 4 bytes per pixel on the GPU.
          textureBytes += width * height * 4;
          textures[i] = texture;
          draw();
        });
        queue = upload;
        await upload;
      } catch {
        // A missing photo: the wipe uses its neighbour.
      }
    }),
  ).then(() => undefined);

  return {
    set(next, p) {
      from = Math.max(0, Math.min(files.length - 2, next));
      progress = p;
      draw();
    },
    resize,
    ready,
    gpuBytes: () => textureBytes + canvas.width * canvas.height * 4,
    // Frees what this created but keeps the context: the canvas outlives this instance (React's dev double
    // mount, a re-run across the mobile breakpoint), and a lost context handed back by getContext() can't draw.
    destroy() {
      dead = true;
      textures.forEach((t) => t && gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
