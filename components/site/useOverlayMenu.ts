"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

const REDUCED = "(prefers-reduced-motion: reduce)";
// iframes included: an embedded app (the Nathia explorer) is part of the dialog's Tab order.
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Shared behaviour for full-screen header menus built on a native <dialog>:
 * - showModal() makes the page inert and moves focus inside; Tab/Shift+Tab wrap within the dialog
 *   (a native modal lets Tab escape to the browser UI past the last element).
 * - Escape plays the exit animation, then closes; focus returns to the menu button.
 * - Lenis is stopped while open so the page behind can't scroll.
 * - In-page links close the menu, then scroll to the section (Lenis, or an instant jump with
 *   reduced motion) and move focus to it instead of back to the button.
 * Animations come from each header (motion tokens, created inside useGSAP). The dialog must not be
 * hidden with visibility when shown, or the browser can't move focus into it: fade with opacity only.
 */
export function useOverlayMenu({ enter, exit }: { enter: () => void; exit: () => unknown }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const closing = useRef(false);
  const returnFocus = useRef(true);

  // Always call the latest animation callbacks without re-binding listeners.
  const anim = useRef({ enter, exit });
  useEffect(() => {
    anim.current = { enter, exit };
  });

  const show = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    returnFocus.current = true;
    dialog.showModal();
    lenis?.stop();
    setOpen(true);
    anim.current.enter();
  }, [lenis]);

  /** Animate out, close, and restart scrolling synchronously (so a following scrollTo works). */
  const hide = useCallback(
    async ({ focusButton = true } = {}) => {
      const dialog = dialogRef.current;
      if (!dialog?.open || closing.current) return;
      closing.current = true;
      returnFocus.current = focusButton;
      await Promise.resolve(anim.current.exit());
      dialog.close();
      lenis?.start();
    },
    [lenis],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      void hide();
    };
    // Any close (ours, or a forced second Escape) ends here.
    const onClose = () => {
      closing.current = false;
      lenis?.start();
      setOpen(false);
      if (returnFocus.current) buttonRef.current?.focus();
    };
    // Focus trap: wrap Tab at the ends of the dialog.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("keydown", onKeyDown);
    };
  }, [hide, lenis]);

  /** Scroll to "#id", clear of the fixed header, then move focus there. */
  const scrollToHash = useCallback(
    (hash: string) => {
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      // Sections skipped by content-visibility only have estimated heights, so the target's position
      // isn't real until they render. Render the sections up to and including the target first.
      for (const section of document.querySelectorAll<HTMLElement>("main > section")) {
        section.style.contentVisibility = "visible";
        if (section === target || section.contains(target)) break;
      }
      // The fixed header's clearance is html's scroll-padding-top (the single source: it also keeps
      // keyboard focus clear). Both scrollIntoView and Lenis honour it, so no extra offset.
      if (lenis && !window.matchMedia(REDUCED).matches) lenis.scrollTo(target);
      else target.scrollIntoView();
      history.replaceState(null, "", hash);
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    },
    [lenis],
  );

  /** onClick for links: in-page anchors close the menu (if open) and scroll; others navigate. */
  const onLinkClick = useCallback(
    async (e: MouseEvent<HTMLAnchorElement>) => {
      // In-page: "#id", or a link to this same page with a hash ("/nathia#manifesto" while on /nathia).
      const url = new URL(e.currentTarget.getAttribute("href") ?? "", window.location.href);
      const inPage = url.hash.length > 1 && url.origin === window.location.origin && url.pathname === window.location.pathname;
      if (!inPage) {
        if (dialogRef.current?.open) void hide({ focusButton: false });
        return;
      }
      e.preventDefault();
      if (dialogRef.current?.open) await hide({ focusButton: false });
      scrollToHash(url.hash);
    },
    [hide, scrollToHash],
  );

  return { dialogRef, buttonRef, open, show, hide, onLinkClick };
}
