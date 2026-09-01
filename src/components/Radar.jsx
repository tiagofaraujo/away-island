function Radar() {
  const filters = [
    { label: 'Previous ATH', value: '> $10M MC' },
    { label: 'Current MC', value: '< $500K' },
    { label: 'Purpose', value: 'Research only' },
    { label: 'Rule', value: 'Both filters required' },
  ];

  const checks = [
    'ATH market cap above $10M must be estimated or verified',
    'Current market cap must be below $500K',
    'Liquidity must be strong enough to enter and exit without getting trapped',
    '24h and 7d volume must show signs of life, not one fake candle',
    'Social accounts and community must still exist after the crash',
    'Bundles, snipers, whales and LP risk still need manual review',
  ];

  return (
    <section id="radar" className="section radar-section">
      <div className="radar-bg" aria-hidden="true" />
      <div className="section-heading center">
        <p className="eyebrow">The Core Product</p>
        <h2>AWAY scans forgotten memes that already had a real cycle.</h2>
        <p>
          The island is no longer only a refuge. It is becoming a research engine
          for memes that once reached attention, collapsed below the surface and
          may still be worth deeper investigation.
        </p>
      </div>

      <div className="radar-layout">
        <div className="radar-terminal">
          <div className="terminal-top"><span /><span /><span /></div>
          <p className="terminal-name">MEME GRAVEYARD RADAR</p>
          <div className="radar-sweep">
            <span className="radar-core">AWAY</span>
            <i className="blip one" />
            <i className="blip two" />
            <i className="blip three" />
          </div>
          <div className="terminal-lines compact">
            <p>&gt; rule 1: ATH market cap above $10M</p>
            <p>&gt; rule 2: current market cap below $500K</p>
            <p>&gt; rule 3: liquidity before narrative</p>
            <p>&gt; rule 4: signal is not a call</p>
            <p>&gt; output: shortlist for deeper research</p>
          </div>
        </div>

        <div className="radar-copy">
          <div className="filter-grid">
            {filters.map((item) => (
              <div className="filter-card" key={item.label}>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="checklist-card">
            <h3>Only survivors pass the first gate.</h3>
            <ul>
              {checks.map((check) => <li key={check}>{check}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Radar;
