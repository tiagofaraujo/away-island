import { links } from '../data/content.js';

function Community() {
  return (
    <section id="community" className="section community-section">
      <div className="community-card">
        <p className="eyebrow">Built with survivors</p>
        <h2>If you found the island, you are already part of the story.</h2>
        <p>
          AWAY is for the ones who got rugged, ignored, dumped on and left behind.
          No fake rescue boat. No fake alpha room. The island grows publicly.
        </p>
        <div className="actions">
          <a href={links.x} className="button button-primary">Follow on X</a>
          <a href={links.community} className="button button-secondary">Join Telegram</a>
          <a href={links.linktree} className="button button-ghost">View Linktree</a>
        </div>
      </div>
    </section>
  );
}

export default Community;
