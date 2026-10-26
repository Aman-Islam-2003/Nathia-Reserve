// Rolling-digit counter. Server component: the markup is static and readable without JS; a scene's timeline
// rolls it with setOdometer() (components/motion/odometer-roll.ts), which needs no GSAP.

/**
 * `digits` columns of 0–9 strips, with a thousands separator, showing `value`. Leading columns the value hasn't
 * reached are dimmed (the "0,000" look). Screen readers get the plain number (sr-only); the columns are
 * decorative. Size it with font classes on `className`; each strip is one line tall (line-height 1).
 * Print shows `final` (default `value`) as plain text instead of the columns, whatever the scroll state
 * [data-counter-final / data-counter-live, CLAUDE.md §4.4].
 */
export function Odometer({
  value = 0,
  final,
  digits = 4,
  separator = ",",
  className = "",
  dimClassName = "opacity-25",
}: {
  value?: number;
  /** The value the timeline ends on; printed instead of the live columns. Default: `value`. */
  final?: number;
  digits?: number;
  separator?: string;
  className?: string;
  /** Applied to leading columns the value hasn't reached yet. */
  dimClassName?: string;
}) {
  const cols = Array.from({ length: digits }, (_, i) => digits - 1 - i); // place value of each column, left → right
  const rounded = Math.round(value);
  const digitAt = (place: number) => Math.floor(rounded / 10 ** place) % 10;
  const dim = (place: number) => place > 0 && rounded < 10 ** place;

  return (
    <span data-odometer data-value={rounded} data-odometer-dim={dimClassName} className={`inline-grid leading-none tabular-nums lining-nums ${className}`.trim()}>
      {/* Screen readers: the current value as text (setOdometer keeps it up to date). */}
      <span className="sr-only" data-odometer-text>
        {rounded.toLocaleString("en-US")}
      </span>
      {/* Print only: the final value as plain text, stacked under the columns (invisible on screen). */}
      <span aria-hidden data-counter-final className="invisible [grid-area:1/1]">
        {Math.round(final ?? value).toLocaleString("en-US")}
      </span>
      <span aria-hidden data-counter-live className="inline-flex [grid-area:1/1]">
        {cols.map((place, i) => (
          <span key={place} className="contents">
            {/* Separator before every third column from the right (thousands). */}
            {i > 0 && place % 3 === 2 && (
              <span data-odometer-sep data-place={place + 1} className={dim(place + 1) ? dimClassName : ""}>
                {separator}
              </span>
            )}
            <span data-odometer-col data-place={place} className={`relative inline-block h-[1em] overflow-hidden ${dim(place) ? dimClassName : ""}`}>
              {/* 0–9 plus a trailing 0, so a roll from 9 to 0 continues downward instead of jumping back. */}
              <span data-odometer-strip className="flex flex-col" style={{ transform: `translateY(${-digitAt(place)}em)` }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
                  <span key={k} className="block h-[1em]">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
