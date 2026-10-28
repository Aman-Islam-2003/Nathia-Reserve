// /nathia/explore[/<tower>[/<level>]]: our own 3D explorer (prototype). Every selection has its own URL, so
// a tower or a level can be shared. Never indexed, like every /nathia route (CLAUDE.md §12).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrbitExplorer } from "@/components/sites/nathia/explorer/OrbitExplorer";
import { getExplorer, levelSlug, parseExplorerPath } from "@/content/nathia/explorer";

export const metadata: Metadata = {
  title: "Explore · The Nathia Reserve",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://thenathiareserve.com/" },
};

/** Every tower and level URL is prerendered (27 static pages): the explorer itself loads after mount. */
export function generateStaticParams() {
  const { towers } = getExplorer();
  return [
    { path: [] },
    ...towers.flatMap((t) => [{ path: [t.slug] }, ...Array.from({ length: t.levels }, (_, i) => ({ path: [t.slug, levelSlug(t, i)] }))]),
  ];
}

type Params = Promise<{ path?: string[] }>;

// The params are read inside Suspense (cacheComponents): the prerendered pages resolve them at build time.
export default function ExplorePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-ink" />}>
      <Explore params={params} />
    </Suspense>
  );
}

async function Explore({ params }: { params: Params }) {
  const { path = [] } = await params;
  const content = getExplorer();
  const initial = parseExplorerPath(content, path);
  if (!initial) notFound();
  return <OrbitExplorer content={content} initial={initial} />;
}
