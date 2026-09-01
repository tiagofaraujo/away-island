import { links } from '../data/content.js';

function Navbar() {
  return (
    <header className="nav-wrap">
      <a className="brand brand-logo" href="#top" aria-label="AWAY Island home">
        <img src="/away-island/assets/away-logo.svg" alt="AWAY logo" />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#story">Story</a>
        <a href="#radar">Radar</a>
        <a href="#shortlist">Shortlist</a>
        <a href="#radar-lab">Scan</a>
        <a href="#safety">Safety</a>
      </nav>
      <a className="nav-cta" href={links.community}>Enter the Island</a>
    </header>
  );
}

export default Navbar;
