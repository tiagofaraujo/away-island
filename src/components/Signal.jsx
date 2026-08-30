import { signalStages } from '../data/content.js';

function Signal() {
  return (
    <section id="signal" className="section signal-section">
      <div className="section-heading center">
        <p className="eyebrow">The Signal</p>
        <h2>The signal is getting stronger.</h2>
        <p>
          AWAY Island has no internet. Only broken signals from the market wreckage:
          dead charts, deleted calls, whale shadows and forgotten memes washing ashore.
        </p>
      </div>
      <div className="signal-composition">
        <img src="/away-island/assets/away-signal.webp" alt="AWAY signal on the island" />
        <div className="signal-cards">
          {signalStages.map((item) => (
            <article className="signal-card" key={item.stage}>
              <small>{item.stage}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Signal;
