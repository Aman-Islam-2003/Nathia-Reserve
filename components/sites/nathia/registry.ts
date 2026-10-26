// Scene registry for the /nathia homepage (registry pattern, CLAUDE.md §6): every scene type in
// content/nathia/schema.ts maps to a component; a missing entry is a type error. Scenes not built yet use the
// skeleton; each step replaces entries with the real scenes (step 4: Ascent; step 5: Manifesto, Explorer, Measure; step 6: Gallery, Ownership, Elevate; step 7: Address; step 8: Day).
import type { ComponentType } from "react";
import type { NathiaSceneType } from "@/content/nathia/schema";
import type { SceneProps } from "./SceneSkeleton";
import { Address } from "./scenes/Address";
import { Day } from "./scenes/Day";
import { Ascent } from "./scenes/Ascent";
import { Elevate } from "./scenes/Elevate";
import { Estate } from "./scenes/Estate";
import { Explorer } from "./scenes/Explorer";
import { Gallery } from "./scenes/Gallery";
import { Manifesto } from "./scenes/Manifesto";
import { Measure } from "./scenes/Measure";
import { Ownership } from "./scenes/Ownership";
import { RegisterCta } from "./scenes/RegisterCta";
import { Residences } from "./scenes/Residences";
import { Returns } from "./scenes/Returns";
import { Snow } from "./scenes/Snow";

export const sceneRegistry: Record<NathiaSceneType, ComponentType<SceneProps>> = {
  ascent: Ascent,
  manifesto: Manifesto,
  explorer: Explorer,
  numbers: Measure,
  address: Address,
  day: Day,
  residences: Residences,
  estate: Estate,
  gallery: Gallery,
  snow: Snow,
  ownership: Ownership,
  returns: Returns,
  elevate: Elevate,
  register: RegisterCta,
};
