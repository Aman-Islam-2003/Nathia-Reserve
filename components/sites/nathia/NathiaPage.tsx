import type { Metadata } from "next";
import { Preloader } from "@/components/motion";
import { PageBackground } from "@/components/providers/PageBackground";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import type { NathiaHome, NathiaMeta, NathiaSite } from "@/content/nathia/schema";
import { ExplorerDialog } from "./ExplorerDialog";
import { NathiaFooter } from "./NathiaFooter";
import { NathiaHeader } from "./NathiaHeader";
import { NathiaHud } from "./NathiaHud";
import { LOGO_ASPECT, LogoMark } from "./LogoMark";
import { gxInset } from "./tokens";
import { sceneRegistry } from "./registry";

/** The /nathia homepage: nathia theme and fonts, header, HUD, the scenes in content order, footer. */
export function NathiaHomePage({ page, site, fonts }: { page: NathiaHome; site: NathiaSite; fonts: string }) {
  const chapterOf = (id: string) => site.chapters.find((c) => c.id === id);
  const explorer = page.sections.find((s) => s.type === "explorer");
  return (
    <ThemeProvider theme="nathia" className={`${fonts} flex flex-1 flex-col`}>
      <PageBackground theme="nathia" scope="page" />
      {/* Exactly as live, every visit (approved exception, CLAUDE.md §12): the logo flies into the header logo. */}
      <Preloader
        mark={<LogoMark />}
        markAspect={LOGO_ASPECT}
        label="Nathia Gali · The Galiyat"
        ariaLabel="Loading The Nathia Reserve"
        target="[data-preloader-target]"
        metaClassName={gxInset}
      />
      <NathiaHeader site={site} />
      <NathiaHud site={site} />
      {/* The 3D explorer overlay, opened by the portal scene and the menu pill (openExplorer). */}
      {explorer && (
        <ExplorerDialog
          url={site.project.explorerUrl}
          marker={explorer.marker}
          label={explorer.label}
          newTab={explorer.newTab}
          close={explorer.close}
          loading={explorer.loading}
        />
      )}
      {/* A plain block parent: pinned scenes must not sit in a flex or grid container (CLAUDE.md §4.2). */}
      {/* data-full-layout: only fixed-height sections skip rendering (every scroll position is real from the start). */}
      <main id="main" tabIndex={-1} data-full-layout className="block outline-none">
        {page.sections.map((scene) => {
          const Scene = sceneRegistry[scene.type];
          // The live chapter list calls the numbers scene "numbers" too; explorer and returns aren't chapters.
          return <Scene key={scene.id} scene={scene} chapter={chapterOf(scene.id)} scenes={page.sections} chapters={site.chapters} site={site} />;
        })}
      </main>
      <NathiaFooter site={site} />
    </ThemeProvider>
  );
}

/** Route metadata: never indexable, canonical to the live page (CLAUDE.md §12). */
export function nathiaMetadata(meta: NathiaMeta): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    robots: { index: false, follow: false },
    alternates: { canonical: meta.canonical },
  };
}
