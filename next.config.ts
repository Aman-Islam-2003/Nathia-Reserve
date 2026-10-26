import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // CSS arrives inside the HTML instead of as render-blocking <link>s, so first paint doesn't wait for
    // another round trip and the theme fonts are discovered from the HTML (PSI: render-blocking requests
    // and a document → CSS → font chain). Fine for Tailwind's small CSS; client navigations still use <link>s.
    inlineCss: true,
  },
  images: {
    // Next's defaults plus 1440 and 1600: cover-scaled frames often need ~1250–1600px, and the jump
    // from 1200 to 1920 over-served them by up to ~1.6x.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1600, 1920, 2048, 3840],
    // AVIF first: ~35–40% smaller than WebP at the same quality (hero: 88 → 57 KB), and on mobile the hero
    // image downloads alongside the HTML and fonts before first paint.
    formats: ["image/avif", "image/webp"],
    // picsum.photos redirects to fastly.picsum.photos; the optimizer checks both hosts.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  // The Nathia clone (CLAUDE.md §12) must never be indexed: the header covers every /nathia page and asset,
  // even if a page misses its robots meta tag. scripts/check-noindex.mjs fails the build if it's missing.
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/nathia", headers: noindex },
      { source: "/nathia/:path*", headers: noindex },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
