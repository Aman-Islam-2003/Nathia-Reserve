import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="footer">
      <p className="h2">{site.altitude.toLocaleString("en-US")} ft. <em>One address.</em></p>
      <p className="label">{site.email} · Demo site, all content is placeholder</p>
    </footer>
  );
}
