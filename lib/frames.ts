/**
 * Scroll-scrubbed image sequence on a <canvas>.
 * - Loads every 8th frame first, then every 4th, 2nd, then the rest, so it works almost immediately.
 * - Decodes each image before use (no stutter on first draw).
 * - Blends the two nearest frames by the fractional position, so motion looks continuous
 *   instead of stepping from frame to frame.
 */
export function createSequence(canvas: HTMLCanvasElement, src: (i: number) => string, count: number) {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
  let pos = 0;          // current position, e.g. 12.4 = 40% of the way from frame 12 to 13
  let rect = { x: 0, y: 0, w: 0, h: 0 };
  let dead = false;

  const nearest = (i: number) => {
    if (images[i]) return images[i];
    for (let d = 1; d < count; d++) { if (images[i - d]) return images[i - d]; if (images[i + d]) return images[i + d]; }
    return null;
  };

  const draw = () => {
    const i = Math.floor(pos), t = pos - i;
    const a = nearest(i);
    if (!a) return;
    if (!rect.w) { // object-fit: cover, computed once per size
      const s = Math.max(canvas.width / a.naturalWidth, canvas.height / a.naturalHeight);
      const w = a.naturalWidth * s, h = a.naturalHeight * s;
      rect = { x: (canvas.width - w) / 2, y: (canvas.height - h) / 2, w, h };
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(a, rect.x, rect.y, rect.w, rect.h);
    const b = i + 1 < count ? nearest(i + 1) : null;
    if (b && b !== a && t > 0.02) {
      ctx.globalAlpha = t;
      ctx.drawImage(b, rect.x, rect.y, rect.w, rect.h);
      ctx.globalAlpha = 1;
    }
  };

  const load = (i: number) => new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const done = () => { images[i] = img; if (!dead && Math.abs(i - pos) < 2) draw(); resolve(); };
      img.decode ? img.decode().then(done, done) : done();
    };
    img.onerror = () => resolve();
    img.src = src(i);
  });

  const order: number[] = [];
  const seen = new Set<number>();
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  load(order[0]).then(async () => {
    let k = 1;
    const worker = async () => { while (!dead && k < order.length) await load(order[k++]); };
    await Promise.all(Array.from({ length: 5 }, worker));
  });

  return {
    /** progress 0–1 through the sequence */
    set(progress: number) { pos = Math.min(count - 1, Math.max(0, progress * (count - 1))); draw(); },
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; rect = { x: 0, y: 0, w: 0, h: 0 }; }
      draw();
    },
    destroy() { dead = true; },
  };
}
