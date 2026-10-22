import { site } from "@/content/site";

export function Header() {
  return (
    <header className="header">
      <a href="#top" className="header__brand">
        {site.brand}
        <small>{site.place}</small>
      </a>
      <a href="#register" className="btn" data-cursor="Register">Register interest</a>
    </header>
  );
}
