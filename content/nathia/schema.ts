// Content model for the Nathia clone (CLAUDE.md §12). All text is the live site's, as rendered (owner-approved
// copy). Every page file exports a getter that validates on first call, never at module load (CLAUDE.md §2).
import { z } from "zod";

/** Validates once, on first call. */
export function lazyParse<S extends z.ZodType>(schema: S, data: z.input<S>): () => z.output<S> {
  let parsed: z.output<S> | undefined;
  return () => (parsed ??= schema.parse(data));
}

// Placeholders are not allowed back in: every text comes from the live site (CLAUDE.md §12).
const text = z.string().min(1).refine((s) => !s.includes("TODO(copy)"), "placeholder text: use the live site's copy");
/** File stem in public/nathia/img/: `<key>-sm.webp` (960w), `<key>-lg.webp` (2000w), some also `<key>-m.webp`. */
export const imgKey = z.string().regex(/^[a-z0-9-]+$/);
const image = z.object({ img: imgKey, alt: text });
const link = z.object({ label: text, href: text });

const LIVE = "https://thenathiareserve.com";

/** Every /nathia page: noindex, nofollow, canonical to the matching live page (CLAUDE.md §12). */
/**
 * A heading line, as the design breaks it: plain text, or segments where `{ em }` parts are italic (rendered in
 * the scene's accent tint), e.g. [{ em: "Reserved" }, " For You."] or ["The Reserve ", { em: "stays warm." }].
 */
export const line = z.union([text, z.array(z.union([text, z.object({ em: text })])).min(1)]);
export type NathiaLine = z.infer<typeof line>;

/** Label "06 —— THE RESIDENCES": the number slot and the text [.label]. */
export const labelSchema = z.object({ no: text, text });

/** A place on the Address terrain map (public/nathia/map/places.json; the route stops in that order). */
export const mapPlaces = ["airport", "islamabad", "rawalpindi", "murree", "ayubia", "abbottabad", "reserve"] as const;
const mapPlace = z.enum(mapPlaces);
export type MapPlace = (typeof mapPlaces)[number];

export const metaSchema = z.object({
  title: text,
  description: text,
  canonical: z.url().refine((u) => u === LIVE || u.startsWith(`${LIVE}/`), "canonical must point to thenathiareserve.com"),
  robots: z.literal("noindex, nofollow"),
});
export type NathiaMeta = z.infer<typeof metaSchema>;

// ---------------------------------------------------------------------------------------------------
// Site-wide facts

export const residenceSchema = z.object({
  id: z.enum(["studio", "1-bedroom", "2-bedroom", "3-bedroom", "penthouse"]),
  name: text,
  collection: text,
  units: z.number().int().positive(),
  /** Square feet, as published ("607 to 1,170"). */
  area: text,
  hero: imgKey,
  plate: imgKey,
  heroAlt: text,
  plateAlt: text,
  soldOut: z.boolean(),
  /** Starting price in PKR crore ("3.9"); empty when sold out. */
  priceCrore: z.string(),
  line: text,
  note: text,
});

export const siteSchema = z.object({
  project: z.object({
    name: text,
    developer: text,
    founder: text,
    locationLine: text,
    road: text,
    address: text,
    elevationFt: z.number().int(),
    instagram: text,
    design: text,
    contractor: text,
    handover: text,
    explorerUrl: z.url(),
  }),
  /** Menu rows: number, title, sub-label (desktop only), link, image shown while hovered. */
  nav: z.array(z.object({ no: text, title: text, sub: text, href: text, img: imgKey })),
  /** Homepage chapter index, in scroll order. */
  chapters: z.array(z.object({ id: text, no: text, name: text })),
  residences: z.array(residenceSchema).length(5),
  places: z.array(z.object({ id: text, name: text, km: text, drive: text })),
  map: z.object({ plusCode: text, lat: z.number(), lng: z.number(), url: z.url() }),
  rental: z.object({
    /** PKR per night, by residence type. */
    nightlyRate: z.record(z.string(), z.number().int().positive()),
    occupancyPct: z.number(),
    managementPct: z.number(),
    /** The monthly instalment, as a share of the price (the returns calculator's crossover). */
    instalmentPct: z.number(),
  }),
  enquiries: z.object({ email: text, instagram: text }),
  /** The closing CTA at the end of every inner page [.pgc]. */
  pageCta: z.object({ label: labelSchema, title: z.array(line).min(1), cta: link }),
  footer: z.object({
    /** Large closing line; the second line renders italic in the accent tint. */
    line: z.array(text).length(2),
    /** The three column labels [.ft-cols]. */
    columns: z.object({ address: text, enquiries: text, explore: text }),
    /** `external`: opens in a new tab (pages not part of the clone, e.g. the live privacy policy). */
    explore: z.array(link.extend({ external: z.boolean().optional() })).min(1),
    mapLabel: text,
    disclaimer: text,
    copyright: text,
  }),
});
export type NathiaSite = z.infer<typeof siteSchema>;

// ---------------------------------------------------------------------------------------------------
// Inner pages: a page hero, numbered sections built from blocks, and the shared closing CTA (site.pageCta).
// Structure and text as rendered on the live pages (owner-approved copy, CLAUDE.md §12).

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text }),
  /** Rows of a ruled list, one line each [.pg-list]. */
  z.object({ type: z.literal("list"), items: z.array(text).min(1) }),
  /** The first column renders in the display face [.pg-table td.display]. */
  z.object({ type: z.literal("table"), columns: z.array(text).min(2), rows: z.array(z.array(z.string())).min(1) }),
  z.object({ type: z.literal("image"), ...image.shape }),
  /** Display quote; the quotation marks are added by the component [.pg-quote]. */
  z.object({ type: z.literal("quote"), text }),
  /** An underlined link with a small note after it [.link + .pg-link-note]. */
  z.object({ type: z.literal("link"), label: text, href: text, note: text.optional() }),
]);
export type NathiaBlock = z.infer<typeof blockSchema>;

export const innerSectionSchema = z.object({ no: text, title: z.array(line).min(1), blocks: z.array(blockSchema).min(1) });

/** Page hero [.pgh]: label, title lines, lede, an optional button (opens the 3D explorer) and the image. */
const pageHeroSchema = z.object({ label: labelSchema, title: z.array(line).min(1), lede: text, action: text.optional(), image });

export const innerPageSchema = z.object({
  slug: z.string().regex(/^\/nathia\/[a-z-]+$/),
  meta: metaSchema,
  hero: pageHeroSchema,
  sections: z.array(innerSectionSchema).min(1),
  /** Pages that also show the address block (the home Address scene's map, elevation and travel times). */
  address: z.boolean().default(false),
});
export type NathiaInnerPage = z.infer<typeof innerPageSchema>;

export const faqPageSchema = z.object({
  slug: z.literal("/nathia/faq"),
  meta: metaSchema,
  hero: pageHeroSchema,
  items: z.array(z.object({ no: text, q: text, a: text })).min(1),
});

// ---------------------------------------------------------------------------------------------------
// Home: an ordered list of scenes (registry pattern, CLAUDE.md §6). `type` picks the scene component in
// components/sites/nathia/registry.ts; `id` is the live section id (anchor). Facts come from the site file.

/**
 * Shared scene fields. `heading`: lines; where a design sets the last part in italics it is the last line.
 * `marker`: the label's number when it differs from the scene's chapter number (live labels are fixed text).
 */
const headed = { label: text, heading: z.array(line).min(1), body: z.string().optional(), marker: z.string().optional() };
const scene = <T extends string, S extends z.ZodRawShape>(type: T, shape: S) =>
  z.object({ type: z.literal(type), id: z.literal(type), ...shape });

export const sceneSchema = z.discriminatedUnion("type", [
  scene("ascent", {
    /** The section's accessible name. */
    ariaLabel: text,
    eyebrow: text,
    /** Title lines; `{ em }` parts render italic in the light tan. */
    title: z.array(line).min(1),
    /** Words that drop in during the climb; `at` is the scene progress (0–1) where each arrives. */
    words: z.array(z.object({ text, at: z.number().min(0).max(1) })).min(1),
    /** Label under the elevation read-out. */
    mistLine: text,
    /** Lines under the title (the second in a lighter weight). */
    sub: z.array(text).min(1),
    cta: link,
    cue: text,
    /** Caption under the framed image at the end of the climb. */
    caption: text,
  }),
  /**
   * `label`, `heading` and `lede` (lines) show in the Ascent's closing flank; the section itself is the plate
   * `image`, the `statement` (its words brighten with the scroll) and `body`.
   */
  scene("manifesto", { ...headed, lede: z.array(text).min(1), statement: text, image }),
  /**
   * The portal into the 3D explorer overlay. `marker` is the label's number slot ("3D"); the last heading line
   * is italic. `poster`: the window image (public/nathia/explorer/). `close`/`loading`: the overlay's labels.
   */
  scene("explorer", {
    ...headed,
    marker: text,
    cta: text,
    newTab: text,
    poster: z.string().startsWith("/nathia/explorer/"),
    posterAlt: text,
    close: text,
    loading: text,
  }),
  /** Live shows only the label: no heading. */
  scene("numbers", {
    ...headed,
    heading: z.array(line).optional(),
    numbers: z
      .array(
        z.object({
          value: z.number().int().nonnegative(),
          unit: z.string(),
          label: text,
          note: z.string(),
          img: imgKey,
          /** Point of the photo (0–1) placed at the stage's horizontal centre and 42% height; `zoom` enlarges it. */
          focus: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).optional(),
          zoom: z.number().min(1).optional(),
        }),
      )
      .length(4),
  }),
  /**
   * The terrain map. `pins`: the places marked on the map (ids from public/nathia/map/places.json; `note` under
   * the name, the Reserve's elevation). `distances`: the panel's rows, lit as the road reaches each (`id`: the
   * place whose arrival lights it). `elevation`: the read-out under the road's head, `start` at the airport and
   * `end` at the Reserve (shown with reduced motion and in print). `closing`: the heading at the end.
   */
  scene("address", {
    ...headed,
    pins: z.array(z.object({ id: mapPlace, name: text, note: text.optional() })).min(1),
    distances: z.object({
      label: labelSchema,
      ariaLabel: text,
      rows: z.array(z.object({ id: mapPlace, name: text, km: text, drive: text })).min(1),
    }),
    elevation: z.object({ label: text, start: text, end: text, unit: text }),
    closing: z.array(line).min(1),
    note: text,
  }),
  /** Four times of day; `zone` names the clock's place, `barLabel` is the segment buttons' group name. */
  scene("day", {
    label: text,
    zone: text,
    barLabel: text,
    moments: z.array(z.object({ time: z.string().regex(/^\d{2}:\d{2}$/), label: text, line: text, img: imgKey })).length(4),
  }),
  /**
   * The types themselves (names, collections, units, areas, prices, photos) come from the site's residences.
   * `hint`: the line under the intro. `interest`: each type's floor-plate request, to `href?unit=<type id>`.
   * `explore`: opens the 3D explorer at `path`. `film`: the strip of interiors, each with its caption.
   */
  scene("residences", {
    ...headed,
    hint: text,
    cta: link,
    interest: link,
    explore: z.object({ label: text, path: z.string().regex(/^\//) }),
    soldOut: text,
    specs: z.object({ units: text, area: text, price: text, availability: text }),
    filmLabel: text,
    film: z.array(z.object({ img: imgKey, label: text })).min(1),
  }),
  /**
   * `towers`: the two tower names either side of the skywalk line (`skywalk`). `rooms`: the row of rooms (`line`:
   * the small word above each name). `chapters`: the pinned film, one photo or video (a file in /video, "-loop"
   * loops, others play once and hold) per chapter, `focus` its object-position; `gauge` shows on the chapter
   * with `below` (the depth read-out). `towerB`: the closing block.
   */
  scene("estate", {
    ...headed,
    towers: z.array(text).length(2),
    skywalk: text,
    roomsLabel: text,
    rooms: z.array(z.object({ name: text, line: text, img: imgKey, alt: text })).min(1),
    filmLabel: text,
    barLabel: text,
    chapterWord: text,
    chapters: z
      .array(
        z.object({
          no: text,
          kicker: text,
          title: text,
          body: text,
          list: z.array(text),
          below: text.optional(),
          img: imgKey.optional(),
          video: imgKey.optional(),
          alt: text,
          focus: z.string().regex(/^\d+% \d+%$/),
        }),
      )
      .min(1),
    gauge: z.object({ feet: z.number().int().positive(), unit: text }),
    towerB: z.object({ heading: z.array(line).min(1), body: text, more: link }),
  }),
  /** The last heading line is the italic end of the same line. `controls`: the lightbox's labels. */
  scene("gallery", {
    ...headed,
    items: z.array(z.object({ img: imgKey, alt: text, caption: text })).min(1),
    controls: z.object({ open: text, previous: text, next: text, close: text }),
  }),
  /** `kicker`: the line above the count. `video` and its still `poster` (`alt`): files in /video. */
  scene("snow", { ...headed, kicker: text, count: z.number().int(), countLabel: text, video: imgKey, alt: text }),
  /** Prices come from the site's residences (`priceCrore`, `soldOut`). */
  scene("ownership", {
    ...headed,
    lede: text,
    list: z.array(text).min(1),
    image,
    structureTitle: text,
    /** Payment plan stops along a line ("10%" / "To book"). */
    structure: z.array(z.object({ value: text, label: text })).min(1),
    pricesTitle: text,
    /** Around each price: "From PKR" 3.9 "crore"; sold-out types show `soldOut` instead. */
    priceLabels: z.object({ from: text, unit: text, soldOut: text }),
    pricing: text,
    approvalsTitle: text,
    approvals: z.array(text),
    works: text,
  }),
  /**
   * The returns calculator. Rates, occupancy and fees come from the site's rental basis; the residences offered
   * are the unsold ones with a nightly rate. Texts with {placeholders} are filled with the calculated figures.
   */
  scene("returns", {
    ...headed,
    lede: text,
    /** "Up to {pct}%" and the line beside it ({occ}: the planned occupancy). */
    top: z.object({ lead: text, tail: text }),
    calcTitle: text,
    fields: z.object({ unit: text, rate: text, occupancy: text }),
    /** Under each residence chip: "from PKR {price} crore". */
    chipPrice: text,
    rateValue: text,
    rateNote: text,
    plannedNote: text,
    reset: text,
    occupancyValue: text,
    occupancyNote: text,
    rows: z.object({
      nights: text,
      gross: text,
      grossSum: text,
      fee: text,
      feeSum: text,
      net: text,
      monthly: text,
      yield: text,
      payback: text,
      paybackValue: text,
    }),
    crossover: z.object({ lead: text, tail: text, under: text }),
    cta: link,
    assumptionsTitle: text,
    assumptions: z.array(text).min(1),
    caveat: text,
  }),
  scene("elevate", {
    ...headed,
    body: z.array(text).min(1),
    /** Quote lines; their words brighten with the scroll. */
    quote: z.array(text).min(1),
    cite: text,
    citeRole: text,
    credits: z.array(z.object({ k: text, v: text })),
    more: link,
    image,
  }),
  /** `note`: beside the button, {price} the lowest unsold starting price. `promises`: numbered, title then text. */
  scene("register", { ...headed, cta: link, note: text, promises: z.array(z.object({ no: text, title: text, body: text })).min(1) }),
]);
export type NathiaScene = z.infer<typeof sceneSchema>;
export type NathiaSceneType = NathiaScene["type"];

export const homeSchema = z
  .object({ slug: z.literal("/nathia"), meta: metaSchema, sections: z.array(sceneSchema).min(1) })
  .refine((p) => new Set(p.sections.map((x) => x.id)).size === p.sections.length, "duplicate scene ids");
export type NathiaHome = z.infer<typeof homeSchema>;

// ---------------------------------------------------------------------------------------------------
// Registration form (CLAUDE.md §12: never submits anywhere real; saved locally, success state only).

/**
 * The register page's hero and its three-step form, as live renders them. The rest of the live landing page
 * (key facts strip, why register, residence cards, ownership, next steps, questions, developer) is modelled
 * when the page is built.
 */
export const registerSchema = z.object({
  slug: z.literal("/nathia/register"),
  meta: metaSchema,
  hero: z.object({ label: labelSchema, title: z.array(line).min(1), proofs: z.array(text).min(1), cta: text, ctaNote: text }),
  form: z.object({
    /** Card label; its number is the current step ("01" … "03"). */
    label: text,
    /** Each step's question: interest, name and city, contact. */
    steps: z.array(text).length(3),
    interests: z.array(text).min(1),
    /** Shown under sold-out residence types. */
    soldOut: text,
    fields: z.object({ name: text, city: text, whatsapp: text, whatsappPlaceholder: text, dialLabel: text, email: text, emailPlaceholder: text }),
    /** Optional "how did you hear" checklist on step 2. */
    heard: z.object({ question: text, optional: text, options: z.array(text).min(1) }),
    actions: z.object({ back: text, next: text, submit: text }),
    /** Step messages: no interest chosen (1), name or city missing (2), WhatsApp number or email invalid (3). */
    errors: z.object({ interest: text, details: text, whatsapp: text, email: text }),
    /**
     * The success state (the form never submits: it saves locally, then shows this). The title is followed by
     * ", <first name>." (or just "."), as live; `explore` links home, `tour` opens the 3D explorer.
     */
    done: z.object({ label: text, title: text, body: text, explore: text, tour: text }),
    privacy: text,
    dialCodes: z.array(z.object({ code: z.string().regex(/^\d+$/), label: text })).min(1),
  }),
});
