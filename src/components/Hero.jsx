import { badges, links } from '../data/content.js';

function Hero() {
  return (
    <section id="top" className="hero-section">
      <div className="hero-bg" aria-hidden="true">
        <img src="/away-island/assets/away-hero.svg" alt="" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow"><span className="live-dot" />Signal unstable · survivor online</p>
        <h1 className="hero-title-classic">
          We were exit liquidity.
          <span>Now we are the meme.</span>
        </h1>
        <p className="hero-tagline hero-tagline-classic">AWAY — The island for traders left behind.</p>
        <p className="hero-copy">
          No fake alpha. No false rescue. Just culture, scars and survival.
        </p>
        <div className="actions">
          <a href={links.community} className="button button-primary">Enter the Island</a>
          <a href={links.x} className="button button-secondary">Follow on X</a>
          <a href={links.announcements} className="button button-ghost">Official Links</a>
        </div>
        <div className="badge-row" aria-label="AWAY safety badges">
          {badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
      </div>
      <div className="hero-strip" aria-hidden="true">
        <span>No signal</span><span>No rescue</span><span>No fake alpha</span><span>No contract yet</span><span>Beware of fakes</span>
      </div>
    </section>
  );
}

export default Hero;
