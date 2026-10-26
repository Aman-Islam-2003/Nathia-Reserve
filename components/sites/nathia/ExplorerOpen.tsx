"use client";

import type { ReactNode } from "react";
import { openExplorer } from "./explorer";

/**
 * Opens the explorer overlay. `button` (default): the accessible control. `surface`: a mouse convenience
 * around a picture (the portal's window), hidden from assistive tech because the button does the same.
 * `path`: where the explorer app opens (its start by default; the residences use "/residences/").
 */
export function ExplorerOpen({
  variant = "button",
  path = "/",
  className,
  children,
  ...data
}: {
  variant?: "button" | "surface";
  path?: string;
  className?: string;
  children: ReactNode;
} & Record<`data-${string}`, string | boolean | undefined>) {
  if (variant === "surface") {
    return (
      <div {...data} role="presentation" onClick={(e) => openExplorer(e.currentTarget, path)} className={className}>
        {children}
      </div>
    );
  }
  return (
    <button {...data} type="button" onClick={(e) => openExplorer(e.currentTarget, path)} className={className}>
      {children}
    </button>
  );
}
