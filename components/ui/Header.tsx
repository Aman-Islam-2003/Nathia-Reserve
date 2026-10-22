"use client";

import { useEffect, useState } from "react";
import { chapters, site } from "@/content/site";
import { useChapter } from "@/components/providers/ChapterProvider";
import { useScrollTo, useLenis } from "@/components/providers/SmoothScroll";

/** Fixed header. Its colours follow the tone of the section underneath (data-tone on <html>). */
export function Header() {
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const active = useChapter();

  useEffect(() => {
    if (open) lenis?.stop(); else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const go = (id: string) => { setOpen(false); scrollTo(`#${id}`); };

  return (
    <>
      <header className="header">
        <a href="#ascent" className="header__brand" onClick={(e) => { e.preventDefault(); go("ascent"); }}>
          <span className="header__name">{site.brand}</span>
          <span className="header__sub">{site.brandSub}</span>
        </a>
        <div className="header__actions">
          <a href="#register" className="btn btn--ghost header__cta" onClick={(e) => { e.preventDefault(); go("register"); }}>
            Register interest
          </a>
          <button type="button" className="header__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className={`burger ${open ? "is-open" : ""}`}><i /><i /></span>
          </button>
        </div>
      </header>

      <nav id="menu" className={`menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <ol className="menu__list">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className={active.id === c.id ? "is-active" : ""} onClick={(e) => { e.preventDefault(); go(c.id); }}>
                <span className="menu__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="menu__label">{c.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="menu__contact">
          <p>{site.location}</p>
          <p className="mono">{site.email}</p>
        </div>
      </nav>
    </>
  );
}
