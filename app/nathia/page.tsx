// /nathia: the Nathia Reserve clone homepage (CLAUDE.md §12). Never indexed: robots meta here, the
// X-Robots-Tag header in next.config.ts, and scripts/check-noindex.mjs in the build.
import { NathiaHomePage, nathiaMetadata } from "@/components/sites/nathia/NathiaPage";
import { getHomePage } from "@/content/nathia/pages/home";
import { getNathiaSite } from "@/content/nathia/site";
import { nathiaFonts } from "@/themes/fonts/nathia";

export const generateMetadata = () => nathiaMetadata(getHomePage().meta);

export default function NathiaHome() {
  return <NathiaHomePage page={getHomePage()} site={getNathiaSite()} fonts={nathiaFonts} />;
}
