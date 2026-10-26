// Opening the 3D explorer overlay from anywhere on the page (the portal scene, its window, the menu pill):
// a window event the single <ExplorerDialog> listens for. No React context, so server components can host
// the triggers as small client buttons.

export const EXPLORER_EVENT = "nathia:explorer";

export interface ExplorerRequest {
  /** Path inside the explorer app ("/" = its start). */
  path: string;
  /** The control that opened it; focus returns there on close. */
  trigger: HTMLElement | null;
}

export function openExplorer(trigger: HTMLElement | null, path = "/") {
  window.dispatchEvent(new CustomEvent<ExplorerRequest>(EXPLORER_EVENT, { detail: { path, trigger } }));
}
