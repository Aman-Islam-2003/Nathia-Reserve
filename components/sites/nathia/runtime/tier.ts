// Device tier for the Nathia WebGL layers (loaded after first paint, from runtime modules only).
// "low": no WebGL, a software or old mobile GPU, ≤ 2 GB memory or ≤ 2 cores → WebGL layers are skipped.
// "mid": touch devices and small screens. "high": everything else. `?tier=low|mid|high` forces one (testing).
// Exactly live's check [useScene tier]: the WebGL2 (else WebGL) renderer name, deviceMemory, hardwareConcurrency.

export type Tier = "low" | "mid" | "high";

const WEAK_GPU = /mali-4|mali-t|adreno \(tm\) [1-4]\d\d|powervr|sgx|swiftshader|llvmpipe/;

let cached: Tier | undefined;

/**
 * The tier, measured once per page. Pass the WebGL context a layer has already created (`null` when
 * creating it failed) to avoid opening a second one just to read the GPU name: creating a context is one of
 * the most expensive steps on a phone.
 */
export function deviceTier(gl?: WebGLRenderingContext | WebGL2RenderingContext | null): Tier {
  if (cached) return cached;
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "low" || forced === "mid" || forced === "high") return (cached = forced);

  let context = gl;
  if (context === undefined) {
    try {
      const canvas = document.createElement("canvas");
      context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    } catch {
      context = null;
    }
  }
  if (!context) return (cached = "low");
  const info = context.getExtension("WEBGL_debug_renderer_info");
  const renderer = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "").toLowerCase() : "";
  if (gl === undefined) context.getExtension("WEBGL_lose_context")?.loseContext();

  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = WEAK_GPU.test(renderer) || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (nav.hardwareConcurrency ?? 8) <= 2;
  if (weak) return (cached = "low");
  const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  return (cached = touch || small ? "mid" : "high");
}
