function Radar() {
  const filters = [
    { label: 'Previous ATH', value: '> $10M MC' },
    { label: 'Current MC', value: '< $500K' },
    { label: 'Status', value: 'Forgotten, not dead' },
    { label: 'Risk', value: 'Liquidity first' },
  ];

  const checks = [
    'ATH vs current market cap drawdown',
    'Liquidity depth and exit risk',
    'Holder distribution and whale pressure',
    'Volume revival and social signal',
    'Community survival after the crash',
    'Fake pumps, bundles and sniper risk',
  ];

  return (
    <section id="radar" className="section radar-section">
      <div className="radar-bg" aria-hidden="true" />
      <div className="section-heading center">
        <p className="eyebrow">The Core Theme</p>
        <h2>The island is building a radar for forgotten memes.</h2>
        <p>
          AWAY is not just a story about being left behind. The long-term mission is to scan the wreckage for meme coins that once reached real attention, then collapsed into silence.
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
            <p>&gt; scanning Solana trenches...</p>
            <p>&gt; previous ATH: over $10M market cap</p>
            <p>&gt; current market cap: under $500K</p>
            <p>&gt; liquidity filter required</p>
            <p>&gt; signal is not a call. signal is research.</p>
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
            <h3>Every signal must survive the checks.</h3>
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
