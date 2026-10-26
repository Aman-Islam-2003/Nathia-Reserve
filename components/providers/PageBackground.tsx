import { themes, type ThemeName } from "@/themes";

/**
 * Paints html and body in the theme's paper colour, so no frame of the page (first paint, overscroll,
 * anything not covered by a section) shows the browser's default white. Theme colours live in TS, so
 * this is a <style> React hoists into <head>, inline with the HTML: no request, applied at first paint.
 *
 * `scope` orders the rules: React keeps precedence groups in the order it first meets them, and the
 * layout renders before the page, so a page's theme ("page") overrides the site default ("site").
 */
export function PageBackground({ theme, scope }: { theme: ThemeName; scope: "site" | "page" }) {
  const { paper } = themes[theme].visual.colors;
  return (
    <style href={`background-${scope}-${theme}`} precedence={`background-${scope}`}>
      {`html,body{background-color:${paper}}`}
    </style>
  );
}
