import { site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" data-tone="dark">
      <p className="footer__big">7,900 ft. <em>One address.</em></p>
      <div className="footer__grid">
        <div>
          <p className="label">Address</p>
          <p>{site.location}</p>
        </div>
        <div>
          <p className="label">Enquiries</p>
          <p className="mono">{site.email}</p>
          <p className="mono">{site.phone}</p>
        </div>
        <div>
          <p className="label">Note</p>
          <p className="footer__fine">Demo build. Images are generated placeholders and all figures are illustrative. Renders shown on a live site should be labelled as artist&apos;s impressions.</p>
        </div>
      </div>
      <p className="footer__copy">© {year} {site.brand}. All rights reserved.</p>
    </footer>
  );
}
