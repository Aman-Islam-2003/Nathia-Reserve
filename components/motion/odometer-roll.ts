// Rolls an <Odometer> to a value. GSAP-free; call it from a scene timeline's onUpdate (or anywhere).
// Like a mechanical counter: a column turns only while every column below it shows 9, and each turn
// happens in the last quarter of the step below (it rests on its digit, then rolls over with a smooth
// start and stop) [Nathia odometer: carry = smoothstep over the last 26% of a step].

/** Share of a step a column rests before it rolls to the next digit. */
const REST = 0.74;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
/** 0 while resting, then 0 → 1 with a smooth start and stop. */
const roll = (f: number) => (f < REST ? 0 : smoothstep((f - REST) / (1 - REST)));

/**
 * Position of the column with place value 10^`place` for `value`, in digits (strip rows): e.g. 7,419.9 →
 * ones ≈ 9.9, tens 1 + a partial roll toward 2. Strips are 11 rows (0–9 and a trailing 0).
 */
export function odometerColumn(value: number, place: number) {
  const v = Math.max(0, value);
  const step = 10 ** place;
  const digit = Math.floor(v / step) % 10;
  // The ones column rolls on the value's fraction; higher columns while everything below shows 9.
  const fraction = place === 0 ? v % 1 : Math.max(0, (v % step) - (step - 1));
  return digit + roll(fraction);
}

/** Sets `root` (an [data-odometer] element) to `value`. Fractional values roll the columns between digits.
 * Dims with the class the <Odometer> was rendered with (data-odometer-dim) unless `dimClassName` is given. */
export function setOdometer(root: Element | null, value: number, dimClassName?: string) {
  if (!root) return;
  const v = Math.max(0, value);
  const rounded = Math.round(v);
  root.setAttribute("data-value", String(rounded));
  const text = root.querySelector("[data-odometer-text]");
  if (text) text.textContent = rounded.toLocaleString("en-US");
  const dims = (dimClassName ?? root.getAttribute("data-odometer-dim") ?? "opacity-25").split(" ").filter(Boolean);
  root.querySelectorAll<HTMLElement>("[data-odometer-col], [data-odometer-sep]").forEach((el) => {
    const place = Number(el.dataset.place);
    // Leading columns the value hasn't reached are dimmed.
    const dimmed = place > 0 && v < 10 ** place;
    dims.forEach((c) => el.classList.toggle(c, dimmed));
    if (!("odometerCol" in el.dataset)) return;
    const strip = el.firstElementChild as HTMLElement | null;
    if (strip) strip.style.transform = `translateY(${-odometerColumn(v, place)}em)`;
  });
}
