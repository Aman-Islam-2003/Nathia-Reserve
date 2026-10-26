import { getImageProps } from "next/image";
import type { CSSProperties } from "react";

/**
 * A Nathia photo served as live serves it [Img]: the original files, no re-encoding, with the small and large
 * variants as width candidates (`<name>-sm.webp 960w, <name>-lg.webp 2000w`) and the given `sizes`, so the
 * browser picks the same file as on live. Or one `file` as it is (posters).
 *
 * Why not next/image's optimizer here: these files are live's already-compressed WebP. Re-encoding them to
 * AVIF made them larger at full size (poster 327 → 354 KB at q75) and lossy, and its smaller widths were
 * visibly softer than live once a cover frame scaled them up (Manifesto, Explorer: 2026-10-25).
 * Built on getImageProps, so it works in server and client components alike.
 */
export function NathiaImg({
  name,
  file,
  candidates,
  alt,
  sizes,
  className,
  style,
  preload = false,
}: {
  /** Photo name in public/nathia/img (`<name>-sm.webp`, `<name>-lg.webp`). */
  name?: string;
  /** A single file instead (served as it is). */
  file?: string;
  /** With `file`: its own width candidates, as live lists them (e.g. "/x-sm.webp 800w, /x.webp 1600w"). */
  candidates?: string;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** The page's LCP image only (CLAUDE.md §7). */
  preload?: boolean;
}) {
  const src = file ?? `/nathia/img/${name}-lg.webp`;
  const { props } = getImageProps({ src, alt, fill: true, sizes, unoptimized: true, preload, className, style });
  const srcSet = name ? `/nathia/img/${name}-sm.webp 960w, /nathia/img/${name}-lg.webp 2000w` : candidates;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps output with live's own srcset; alt is in props
  return <img {...props} srcSet={srcSet} sizes={srcSet ? sizes : undefined} />;
}
