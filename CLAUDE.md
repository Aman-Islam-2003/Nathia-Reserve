# Project rules for AI assistants (Claude Code, Cursor, etc.)

Cinematic scroll site: Next.js 16 App Router, TypeScript, Tailwind 4, GSAP 3.15 (ScrollTrigger,
SplitText, CustomEase), Lenis, Three.js (lazy), Zod.

## Rules

- **Content** goes in `content/site.ts`, never hard-coded in components.
- **GSAP** is imported only from `@/lib/gsap` (plugins are registered there). Use `useGSAP` with a
  `scope` ref so everything is cleaned up. Use the site eases `"reserve"` / `"reserveOut"`.
- **Every animation must check `prefersReducedMotion()`** and leave content visible without JS.
- Animate only `transform`, `opacity`, `clip-path`. No layout properties.
- **Pinned/sticky sections**: prefer CSS `position: sticky` + scrubbed ScrollTrigger (see `Day.tsx`,
  `Ascent.tsx`). Use GSAP `pin` only when content must translate (see `Residences.tsx`).
- New sections: add a `<section id data-chapter>` and register it in `chapters` in `content/site.ts`
  (drives the HUD, menu and header tone).
- Reuse `components/motion/*` before writing a new effect. New effects go there with a short doc comment.
- Heavy libraries (Three.js, maps) must be dynamically imported near the viewport.
- Images: `next/image` with `sizes`. Decorative duplicates get `aria-hidden`.
- Tokens (colours, type scale, easing) live in `:root` in `app/globals.css`.

## Commands

- `npm run dev` · `npm run build` · `npm run typecheck`
- `npm run placeholders` regenerates demo art
- `npm run images` optimises `./raw` → `public/img`
- `npm run frames -- video.mp4 80` makes the hero sequence
