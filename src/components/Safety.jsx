import { safetyItems } from '../data/content.js';

function Safety() {
  return (
    <section id="safety" className="section safety-section">
      <div className="section-heading center">
        <p className="eyebrow">Safety first</p>
        <h2>No contract yet. Beware of fakes.</h2>
        <p>
          Any contract claiming to be $AWAY before being posted by official AWAY channels is fake.
          There is no presale, no private allocation and no paid alpha group.
        </p>
      </div>
      <div className="safety-grid">
        {safetyItems.map((item) => <div key={item}>{item}</div>)}
      </div>
      <p className="disclaimer">
        $AWAY is culture, satire and community. Crypto is high risk. No guaranteed returns.
        No financial promises. No fake rescue.
      </p>
    </section>
  );
}

export default Safety;
