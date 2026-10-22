# The Ridge — demo scroll site

A simple dummy site in the style of premium real estate sites (inspired by thenathiareserve.com, not a copy).
All text, prices and images are placeholders.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Tools

- **Next.js** — the website framework
- **GSAP** (ScrollTrigger + SplitText) — scroll animations and text reveals
- **Lenis** — smooth scrolling
- **Tailwind CSS** — available for styling (main styles are in `app/globals.css`)

## Sections

1. **Hero** — scroll plays an 80-image sequence (frames blend smoothly) and the altitude counts up to 7,900 ft
2. **About** — text slides in line by line
3. **Numbers** — rolling counters
4. **Residences** — cards scroll sideways (desktop)
5. **Register** — simple enquiry form

Also: Lenis smooth scroll (lerp 0.085) and a custom cursor (`components/Cursor.tsx`). Add `data-cursor="Label"` to any element to show a label on hover.

> Judge smoothness with `npm run build && npm start`, not `npm run dev` — dev mode is much slower.

## Where things are

- Text and numbers: `content/site.ts`
- Colours and fonts: top of `app/globals.css`
- Images: `public/img`, hero frames: `public/frames` (001.webp … 080.webp)
- Each section: `components/`

To swap the hero animation, export a short video as numbered images into `public/frames`
and update `hero.frames` in `content/site.ts`.
