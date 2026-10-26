// Scene layout for the /nathia homepage, measured on the live site at 1440×900 and 390×844
// (docs/nathia/inventory.md; DOM geometry in step 3). Content lives in content/nathia/pages/home.ts.
import type { NathiaSceneType } from "@/content/nathia/schema";

export type SceneSurface = "paper" | "ink" | "surfaceAlt" | "surfaceRaised";

export interface SceneLayout {
  /** Pinned scenes: pin length in viewport heights (desktop / ≤899px). The scene then takes 1 + pin viewports. */
  pin?: { desktop: number; mobile: number };
  /**
   * Skeleton only: measured height of a scene that isn't pinned as a whole (px at 1440×900 / 390×844). Real
   * scenes size to their content; this keeps the skeleton's scroll positions true to the live page meanwhile.
   */
  height?: { desktop: number; mobile: number };
  /** Background, from the live section's computed background colour. */
  surface: SceneSurface;
}

export const sceneLayout: Record<NathiaSceneType, SceneLayout> = {
  // Pin += 6.4 × vh, 5 on mobile [Ascent: end `+=${innerHeight * (mobile ? 5 : 6.4)}`]; 6660 / 5064 px measured.
  ascent: { pin: { desktop: 6.4, mobile: 5 }, surface: "paper" },
  manifesto: { height: { desktop: 936, mobile: 890 }, surface: "ink" }, // bone background
  explorer: { pin: { desktop: 2.2, mobile: 1.6 }, surface: "ink" }, // [ExplorerPortal: 2.2 / 1.6]; 2880 / 2194 px
  numbers: { pin: { desktop: 3.4, mobile: 2.8 }, surface: "paper" }, // [Measure: 3.4 / 2.8]; 3960 / 3207 px
  address: { pin: { desktop: 4, mobile: 3.4 }, surface: "surfaceRaised" }, // measured 4500 / 3713 px → 4 / 3.4
  day: { pin: { desktop: 3.2, mobile: 2.8 }, surface: "paper" }, // [Day: 3.2 / 2.8]; 3780 / 3207 px
  // Horizontal track (HorizontalScroll, residencesTiming): the pin is .95 × the track overflow (456vw), so it
  // follows the width (7138 px at 1440 × 900); below 900px nothing pins and the panels stack (6761 px at 390).
  residences: { surface: "ink" },
  // Content-sized, with the chapter film pinned inside it (estateTiming: .72 / .66 viewports per chapter);
  // 6632 / 5571 px measured on live.
  estate: { surface: "surfaceAlt" },
  gallery: { height: { desktop: 1877, mobile: 1907 }, surface: "ink" },
  // Live background rgb(11, 15, 18) is behind the snow video; paper (12, 15, 13) is visually the same.
  snow: { pin: { desktop: 2.4, mobile: 1.8 }, surface: "paper" }, // [Snow: 2.4 / 1.8]; 3060 / 2363 px
  ownership: { height: { desktop: 2976, mobile: 3231 }, surface: "ink" },
  returns: { surface: "surfaceAlt" }, // content-sized; 2342 / 3340 px measured on live
  elevate: { height: { desktop: 1501, mobile: 1770 }, surface: "paper" },
  register: { surface: "surfaceAlt" }, // content-sized; 809 / 1033 px measured on live
};

/** Surface → background and text classes, and the tone the header and HUD adapt to. */
export const surfaceStyle: Record<SceneSurface, { className: string; tone: "dark" | "light" }> = {
  paper: { className: "bg-paper text-ink", tone: "dark" },
  ink: { className: "bg-ink text-on-ink", tone: "light" },
  surfaceAlt: { className: "bg-surface-alt text-ink", tone: "dark" },
  surfaceRaised: { className: "bg-surface-raised text-ink", tone: "dark" },
};
