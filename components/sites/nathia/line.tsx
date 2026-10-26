import { Fragment, type ReactNode } from "react";
import type { NathiaLine } from "@/content/nathia/schema";

/** A heading line from content: plain text, or segments whose `{ em }` parts render italic in `emClassName`. */
export function renderLine(line: NathiaLine, emClassName: string): ReactNode {
  if (typeof line === "string") return line;
  return line.map((segment, i) =>
    typeof segment === "string" ? (
      <Fragment key={i}>{segment}</Fragment>
    ) : (
      <em key={i} className={emClassName}>
        {segment.em}
      </em>
    ),
  );
}

/** Lines as keyed nodes, for components that take a list of lines (RiseLines). */
export function renderLines(lines: NathiaLine[], emClassName: string): ReactNode[] {
  return lines.map((line, i) => <Fragment key={i}>{renderLine(line, emClassName)}</Fragment>);
}

/** The plain text of a line (accessible names). */
export const lineText = (line: NathiaLine) => (typeof line === "string" ? line : line.map((s) => (typeof s === "string" ? s : s.em)).join(""));
