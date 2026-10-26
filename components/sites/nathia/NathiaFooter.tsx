import { Parallax } from "@/components/motion";
import type { NathiaSite } from "@/content/nathia/schema";
import { footerDrift, gx } from "./tokens";

/** The column labels [.ft-cols .label]: the label style, but inheriting the columns' 1.7 line height (the label token's 1.6 made each 1.1px shorter than live). */
const columnLabel = "text-xs leading-[1.7] font-medium uppercase tracking-[0.26em]";
import { NathiaImg } from "./NathiaImg";

/**
 * Footer [.ft]: night photo behind [.ft-media, object-position 50% 30%], a large two-part line, three columns
 * (address, enquiries, explore + map link), the wordmark as a tan mask [.ft-mark], the disclaimer and the
 * copyright line. All sizes from the live CSS. The photo and the wordmark settle as the footer scrolls in.
 */
export function NathiaFooter({ site }: { site: NathiaSite }) {
  const { footer, project, enquiries, map } = site;
  return (
    <footer className="relative overflow-hidden bg-paper text-ink">
      <div aria-hidden className="absolute inset-0">
        {/* Settles into place as the footer scrolls in [Footer: yPercent -16 → 0, scale 1.18 → 1]. */}
        <Parallax drift={footerDrift.photo} range={{ ...footerDrift.range, closest: "footer" }} className="absolute inset-0">
          <NathiaImg name="day-2200" alt="" sizes="100vw" className="object-cover object-[50%_30%]" />
        </Parallax>
        {/* [.ft-media:after]: paper from 55% to 92% opacity, full at 70% of the height. */}
        <div className="absolute inset-0 bg-linear-to-b from-paper/55 to-paper/92 to-70%" />
      </div>
      {/* [.ft-inner]: 24vh top, 5vh bottom. */}
      <div className={`relative pt-[24vh] pb-[5vh] ${gx}`}>
        {/* [.ft-line]: clamp(2.6rem, 6.4vw, 7.4rem), line-height .95; second part italic 500 in the light tan. */}
        <p className="font-display text-[clamp(2.6rem,6.4vw,7.4rem)] font-semibold leading-[0.95] tracking-display">
          {footer.line[0]}
          <br />
          <em className="font-medium text-accent-soft">{footer.line[1]}</em>
        </p>

        {/* [.ft-cols]: three columns, gap 4vw, 14vh above, .92rem / 1.7; one column on mobile, gap 4vh. */}
        <div className="mt-[14vh] grid grid-cols-3 gap-[4vw] text-[0.92rem] leading-[1.7] max-[899px]:grid-cols-1 max-[899px]:gap-[4vh]">
          <div>
            <span className={`${columnLabel} mb-3 block text-accent-soft`}>{footer.columns.address}</span>
            <p>
              {project.road}
              <br />
              {project.address}
            </p>
          </div>
          <div>
            <span className={`${columnLabel} mb-3 block text-accent-soft`}>{footer.columns.enquiries}</span>
            <p>
              {enquiries.email}
              <br />
              {enquiries.instagram}
            </p>
          </div>
          <nav aria-label={footer.columns.explore}>
            <span className={`${columnLabel} mb-3 block text-accent-soft`}>{footer.columns.explore}</span>
            <ul>
              {footer.explore.map((link) => (
                <li key={link.href}>
                  <a href={link.href} {...(link.external ? { target: "_blank", rel: "noopener" } : {})} className="hover:text-accent-soft">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={map.url} target="_blank" rel="noopener" className="hover:text-accent-soft">
                  {footer.mapLabel}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* [.ft-mark]: the logo as a mask, tan at 92%, full width up to 62vh tall, 10vh above. */}
        <Parallax drift={footerDrift.mark} range={{ ...footerDrift.range, closest: "footer" }} className="mt-[10vh]">
          <span
            aria-hidden
            className="block aspect-[6454/3418] max-h-[62vh] w-full bg-accent opacity-92 [mask:url(/nathia/logo.svg)_0/contain_no-repeat]"
          />
        </Parallax>

        {/* [.ft-disclaimer]: .72rem / 1.7, bone at 50%, max 70rem, 6vh above. */}
        <p className="mt-[6vh] max-w-[70rem] text-[0.72rem] leading-[1.7] text-ink/50">{footer.disclaimer}</p>
        {/* [.ft-copy]: .64rem, tracking .14em, uppercase, bone at 50%, 3vh above. */}
        <p className="mt-[3vh] font-mono text-[0.64rem] uppercase tracking-[0.14em] text-ink/50">{footer.copyright}</p>
      </div>
    </footer>
  );
}
