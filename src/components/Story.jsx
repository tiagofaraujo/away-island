import { loreCards } from '../data/content.js';

function Story() {
  return (
    <section id="story" className="section story-section split-layout">
      <div className="section-copy">
        <p className="eyebrow">Chapter 1 — The First Survivor</p>
        <h2>He was not flying to get rich. He was flying away.</h2>
        <p>
          Away from dead charts, rugs and broken calls. A job in New Zealand. A new life.
          A clean start. Then the storm hit. Somewhere in the South Pacific,
          AWAY Island found its first survivor.
        </p>
        <div className="mini-grid">
          {loreCards.map((card) => (
            <article className="mini-card" key={card.title}>
              <small>{card.label}</small>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </div>
      <figure className="image-card tall">
        <img src="/away-island/assets/away-survivor.webp" alt="AWAY survivor on a stormy shore" />
        <figcaption>Lost the money. Not the hope.</figcaption>
      </figure>
    </section>
  );
}

export default Story;
