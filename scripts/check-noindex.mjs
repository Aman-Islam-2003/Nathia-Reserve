// Fails the build if any part of the Nathia clone could be indexed (CLAUDE.md §12). Runs after `next build`
// (npm `postbuild`, and in `npm run lhci`). Checks the build output, not the source, so nothing slips through:
//   1. an X-Robots-Tag "noindex" header rule matches /nathia and every path under it
//   2. every prerendered /nathia page has <meta name="robots"> with noindex and nofollow, and a canonical
//      link to the matching page on https://thenathiareserve.com
//   3. no sitemap and no robots.txt mentions /nathia
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const NEXT = ".next";
const LIVE = "https://thenathiareserve.com";
const failures = [];
const fail = (msg) => failures.push(msg);

if (!existsSync(join(NEXT, "routes-manifest.json"))) {
  console.error("check-noindex: no build output (.next/routes-manifest.json). Run next build first.");
  process.exit(1);
}

// 1. Header rules, as Next compiled them.
const manifest = JSON.parse(readFileSync(join(NEXT, "routes-manifest.json"), "utf8"));
const rules = (manifest.headers ?? []).map((h) => ({ ...h, re: new RegExp(h.regex) }));
const noindexFor = (path) =>
  rules.some((r) => r.re.test(path) && r.headers.some((h) => h.key.toLowerCase() === "x-robots-tag" && /noindex/i.test(h.value)));
for (const path of ["/nathia", "/nathia/residences", "/nathia/img/cloudsea-lg.webp", "/nathia/a/b/c"]) {
  if (!noindexFor(path)) fail(`no X-Robots-Tag noindex header rule matches ${path} (next.config.ts headers())`);
}

// 2. Prerendered pages under app/nathia.
const appDir = join(NEXT, "server", "app");
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const pages = existsSync(appDir)
  ? walk(appDir).filter((f) => f.endsWith(".html") && /^nathia([\\/.]|$)/.test(relative(appDir, f)))
  : [];
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const route = "/" + relative(appDir, file).split(sep).join("/").replace(/\.html$/, "").replace(/\/index$/, "");
  const robots = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i)?.[1] ?? html.match(/<meta[^>]+content="([^"]*)"[^>]+name="robots"/i)?.[1];
  if (!robots || !/noindex/i.test(robots) || !/nofollow/i.test(robots)) fail(`${route}: robots meta must be "noindex, nofollow" (found: ${robots ?? "none"})`);
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i)?.[1] ?? html.match(/<link[^>]+href="([^"]*)"[^>]+rel="canonical"/i)?.[1];
  if (!canonical || !(canonical === LIVE || canonical.startsWith(`${LIVE}/`))) fail(`${route}: canonical must point to ${LIVE} (found: ${canonical ?? "none"})`);
}

// 3. Sitemaps and robots.txt, wherever they're generated or served from.
const candidates = [
  ...(existsSync(appDir) ? walk(appDir).filter((f) => /(sitemap[^\\/]*|robots)\.(xml|txt)(\.body)?$/.test(f)) : []),
  ...(existsSync("public") ? readdirSync("public").filter((f) => /^(sitemap.*\.xml|robots\.txt)$/.test(f)).map((f) => join("public", f)) : []),
];
for (const file of candidates) {
  const body = readFileSync(file, "utf8");
  if (/sitemap/i.test(file) && /\/nathia(\/|<|"|\s|$)/.test(body)) fail(`${file}: sitemap lists /nathia URLs`);
  if (/robots\.txt/i.test(file) && /^\s*allow:\s*\/nathia/im.test(body)) fail(`${file}: robots.txt explicitly allows /nathia`);
}

if (failures.length) {
  console.error(`check-noindex: ${failures.length} problem(s) — /nathia could be indexed:\n  - ${failures.join("\n  - ")}`);
  process.exit(1);
}
console.log(`check-noindex: ok (header rule covers /nathia/*, ${pages.length} /nathia page(s) checked, ${candidates.length} sitemap/robots file(s) checked)`);
