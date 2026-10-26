import type { ElementType, ReactNode } from "react";
import { label } from "./tokens";

/**
 * Scene label "02 —— THE RESERVE" [.label]: the number in mono (tracking .08em) in the accent, a 2.4em rule
 * at half opacity after it, then the label, .9em apart. On light (bone) surfaces the number uses the deeper
 * accent [.tone-light .label > span:first-child]. `as`: the element (a sub-section title is an h3).
 */
export function SceneLabel({
  no,
  tone,
  as: Tag = "p",
  className = "",
  children,
}: {
  no: string;
  tone: "dark" | "light";
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`${label} inline-flex items-center gap-[0.9em] ${className}`.trim()}>
      <span className={`inline-flex items-center font-mono tracking-[0.08em] ${tone === "light" ? "text-accent-on-ink" : "text-accent"}`}>
        {no}
        <span aria-hidden className="ml-[0.9em] inline-block h-px w-[2.4em] bg-current opacity-50" />
      </span>
      {children}
    </Tag>
  );
}
