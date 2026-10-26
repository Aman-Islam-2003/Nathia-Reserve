"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Reveal } from "@/components/motion";
import type { NathiaScene } from "@/content/nathia/schema";
import { Arrow } from "./Arrow";
import { crore, fill, lakh, returnsFor, whole } from "./returns";
import { focusRing, pill, pillHover } from "./tokens";

type ReturnsScene = Extract<NathiaScene, { type: "returns" }>;
export interface ReturnsOption {
  id: string;
  name: string;
  priceCrore: string;
  /** Planned PKR a night. */
  rate: number;
}

/** A range input styled as live [.rt-slider input]: a 1px line, a 22px tan thumb, the focus ring 6px out. */
const range =
  "w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-line [&::-moz-range-track]:h-px [&::-moz-range-track]:bg-line [&::-webkit-slider-thumb]:-mt-[11px] [&::-webkit-slider-thumb]:size-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-moz-range-thumb]:size-[22px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-accent";
/** The field label row [.rt-lab, .rt-field legend]. */
const labelRow = "mb-[1.4rem] flex w-full items-baseline justify-between gap-4 text-sm leading-[1.6] uppercase tracking-[0.1em] text-muted";
const value = "whitespace-nowrap text-[1.05rem] font-medium normal-case tracking-[0.02em] text-ink max-[899px]:text-[1rem]";
const hint = "mt-[0.9rem] block text-[0.78rem] leading-[1.5] text-muted/75";

/**
 * The returns calculator [.rt-calc]: residence chips, the nightly rate (±50% of the planned rate, steps of
 * 5,000; back to the planned rate on each residence change) and the occupancy (30–80%), then the yearly
 * figures, the crossover against the monthly instalment, and the request for a specific residence. Figures as
 * live [returns.ts]. Live's analytics call on first use is not ported (CLAUDE.md §12).
 *
 * Accessibility: chips are radios in a fieldset; each slider is named by its field, announces its value as
 * text (aria-valuetext) and is described by its hint; a polite live region announces the yield and net.
 */
export function ReturnsCalc({
  scene,
  options,
  occupancy: plannedOccupancy,
  managementPct,
  instalmentPct,
}: {
  scene: ReturnsScene;
  options: ReturnsOption[];
  occupancy: number;
  managementPct: number;
  instalmentPct: number;
}) {
  const ids = useId();
  const [unit, setUnit] = useState(options[0]);
  const [rate, setRate] = useState(options[0].rate);
  const [occupancy, setOccupancy] = useState(plannedOccupancy);
  const r = returnsFor({ priceCrore: Number(unit.priceCrore), rate, occupancy, managementPct, instalmentPct });
  const { rows } = scene;

  return (
    <>
      {/* [.rt-in] */}
      <div>
        <h3 className="mb-[3vh] inline-flex text-xs leading-[1.6] font-medium uppercase tracking-[0.26em]">{scene.calcTitle}</h3>
        <fieldset className="mb-[4vh] border-0 p-0">
          <legend className={labelRow}>{scene.fields.unit}</legend>
          <div className="flex flex-wrap gap-[0.6rem]">
            {options.map((o) => (
              <label key={o.id} data-cursor="hide" className="group relative cursor-pointer">
                <input
                  type="radio"
                  name={`${ids}-unit`}
                  value={o.name}
                  checked={o.id === unit.id}
                  onChange={() => {
                    setUnit(o);
                    setRate(o.rate);
                  }}
                  className="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0"
                />
                <span className="flex flex-col gap-1 border border-line px-[1.2rem] py-[0.85rem] text-[0.98rem] text-ink transition-[border-color,background-color] duration-300 group-hover:border-accent-on-ink peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent max-[899px]:text-[1rem]">
                  {o.name}
                  <small className="text-[0.72rem] tracking-[0.06em] text-muted">{fill(scene.chipPrice, { price: o.priceCrore })}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mb-[4vh] block">
          <span className={labelRow}>
            {scene.fields.rate}
            <strong className={value}>{fill(scene.rateValue, { rate: whole(rate) })}</strong>
          </span>
          <input
            type="range"
            min={Math.round(0.5 * unit.rate)}
            max={Math.round(1.5 * unit.rate)}
            step={5000}
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
            aria-labelledby={`${ids}-rate-name`}
            aria-valuetext={fill(scene.rateValue, { rate: whole(rate) })}
            aria-describedby={`${ids}-rate-hint`}
            className={range}
          />
          <span id={`${ids}-rate-hint`} className={hint}>
            {/* One string: as separate text nodes, the space between them is lost from the slider's description. */}
            {`${scene.rateNote} ${fill(scene.plannedNote, { planned: whole(unit.rate) })}`}
            {rate !== unit.rate && (
              <button type="button" onClick={() => setRate(unit.rate)} className="ml-2 cursor-pointer text-accent underline underline-offset-[3px] hover:text-accent-soft">
                {scene.reset}
              </button>
            )}
          </span>
          <span id={`${ids}-rate-name`} hidden>
            {scene.fields.rate}
          </span>
        </label>

        <label className="mb-[4vh] block">
          <span className={labelRow}>
            {scene.fields.occupancy}
            <strong className={value}>{fill(scene.occupancyValue, { occ: occupancy, nights: whole((occupancy / 100) * 365) })}</strong>
          </span>
          <input
            type="range"
            min={30}
            max={80}
            step={1}
            value={occupancy}
            onChange={(e) => setOccupancy(+e.target.value)}
            aria-labelledby={`${ids}-occ-name`}
            aria-valuetext={fill(scene.occupancyValue, { occ: occupancy, nights: whole((occupancy / 100) * 365) })}
            aria-describedby={`${ids}-occ-hint`}
            className={range}
          />
          <span id={`${ids}-occ-hint`} className={hint}>
            {scene.occupancyNote}
          </span>
          <span id={`${ids}-occ-name`} hidden>
            {scene.fields.occupancy}
          </span>
        </label>
      </div>

      {/* [.rt-out] */}
      <div>
        {/* [.rt-row]: rise 14px in turn (.07 s apart, .9 s) when the figures reach 85% of the screen. */}
        <Reveal as="ul" y={14} stagger={0.07} duration={0.9} at={0.85} className="m-0 list-none border-t border-line p-0">
          {(
            [
              [rows.nights, whole(r.nights)],
              [<>{rows.gross} <small className="opacity-70">{fill(rows.grossSum, { rate: whole(rate), nights: whole(r.nights) })}</small></>, crore(r.gross)],
              [<>{rows.fee} <small className="opacity-70">{fill(rows.feeSum, { pct: managementPct })}</small></>, `− ${crore(r.fee)}`, "neg"],
              [rows.net, crore(r.net), "net"],
              [rows.monthly, lakh(r.monthly)],
              [rows.yield, `${r.yieldPct.toFixed(1)}%`, "big"],
              [rows.payback, fill(rows.paybackValue, { years: r.payback.toFixed(1) })],
            ] as const
          ).map(([label, figure, kind], i) => (
            <li key={i} className="flex items-baseline justify-between gap-6 border-b border-line py-[1.15rem]">
              <span className={`text-base leading-[1.6] ${kind === "net" ? "text-ink" : "text-muted"}`}>{label}</span>
              <b
                className={`whitespace-nowrap tabular-nums ${
                  kind === "big"
                    ? // Below 900px live's `.rt-row b { 1rem }` comes later than `.rt-big b`, so the yield is 1rem there too.
                      "font-display text-[clamp(2rem,3.4vw,3rem)] leading-none font-medium text-accent max-[899px]:text-[1rem]"
                    : kind === "net"
                      ? "text-[1.35rem] font-medium text-ink max-[899px]:text-[1rem]"
                      : `text-[1.1rem] font-medium max-[899px]:text-[1rem] ${kind === "neg" ? "text-accent-on-ink" : ""}`
                }`}
              >
                {figure}
              </b>
            </li>
          ))}
        </Reveal>
        {r.times >= 1 ? (
          <p className="mt-[3vh] max-w-[44ch] text-base leading-[1.6] text-ink">
            {scene.crossover.lead} <strong className="font-display text-[1.6em] font-medium text-accent">{r.times.toFixed(1)}×</strong> {scene.crossover.tail}
          </p>
        ) : (
          <p className="mt-[3vh] max-w-[44ch] text-base leading-[1.6] text-muted">{fill(scene.crossover.under, { monthly: lakh(r.monthly), instalment: lakh(r.instalment) })}</p>
        )}
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {`${rows.yield}: ${r.yieldPct.toFixed(1)}%. ${rows.net}: ${crore(r.net)}.`}
        </p>
        <Link
          href={`${scene.cta.href}?unit=${encodeURIComponent(unit.id)}`}
          data-cursor="hide"
          className={`mt-[4vh] ${pill} ${pillHover} border-accent bg-accent text-paper ${focusRing}`}
        >
          <span>{scene.cta.label}</span>
          <Arrow className="h-2.5 w-[18px]" />
        </Link>
      </div>
    </>
  );
}
