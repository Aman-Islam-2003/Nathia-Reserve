// Critical-asset registry for <Preloader>. GSAP-free, safe in the initial bundle.
// Scenes register what must be ready before the page is revealed (a hero still, a first frame); the
// preloader shows the real progress and waits for all of it (within its max duration).

let total = 0;
let settled = 0;
const pending = new Set<Promise<unknown>>();
const listeners = new Set<(progress: number) => void>();

const progress = () => (total === 0 ? 1 : settled / total);
const notify = () => listeners.forEach((l) => l(progress()));

/** Declares a critical asset. Rejections count as done (a missing asset must not block the page). */
export function registerCritical(promise: Promise<unknown>) {
  total++;
  const p = promise.catch(() => {}).finally(() => {
    settled++;
    pending.delete(p);
    notify();
  });
  pending.add(p);
  notify();
  return p;
}

/** Loads an image as a critical asset (resolves once decoded). */
export function registerCriticalImage(src: string) {
  return registerCritical(
    new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => (img.decode ? img.decode().then(resolve, resolve) : resolve());
      img.onerror = reject;
      img.src = src;
    }),
  );
}

/** Subscribes to progress (0 → 1). Calls back immediately with the current value. Returns an unsubscribe. */
export function onPreloadProgress(listener: (progress: number) => void) {
  listeners.add(listener);
  listener(progress());
  return () => listeners.delete(listener);
}

/** Resolves when everything registered so far (and anything registered while waiting) has settled. */
export async function allCritical() {
  while (pending.size) await Promise.all([...pending]);
}
