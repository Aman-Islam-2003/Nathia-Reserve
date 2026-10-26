// Every /nathia route: the site-wide effects that persist across its pages (CLAUDE.md §12).
import type { ReactNode } from "react";
import { NathiaChrome } from "@/components/sites/nathia/NathiaChrome";
import { nathiaFonts } from "@/themes/fonts/nathia";

export default function NathiaLayout({ children }: { children: ReactNode }) {
  return <NathiaChrome fonts={nathiaFonts}>{children}</NathiaChrome>;
}
