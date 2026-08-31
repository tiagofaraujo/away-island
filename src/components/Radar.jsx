function Radar() {
  const filters = [
    { label: 'Past signal', value: 'ATH > $10M MC' },
    { label: 'Current wreckage', value: 'MC < $500K' },
    { label: 'Narrative state', value: 'Forgotten, not dead' },
    { label: 'Rule zero', value: 'Liquidity first' },
  ];

  const checks = [
    'ATH market cap vs current market cap drawdown',
    'Current liquidity depth and realistic exit risk',
    '24h volume revival, not just one candle',
    'Holder distribution and whale pressure',
    'Social links, Telegram/X survival and community pulse',
    'Fake pumps, bundles, snipers and dead liquidity traps',
  ];

  return (
    <section id="radar" className="section radar-section">
      <div className="radar-bg" aria-hidden="true" />
      <div className="section-heading center">
        <p className="eyebrow">AWAY Radar · Core Theme</p>
        <h2>The island where forgotten memes wash ashore.</h2>
        <p>
          AWAY is a meme culture project with a research engine at its core.
          The Dead Terminal scans market wreckage for memes that once reached real attention,
          then disappeared below the waves. A signal is not a call. A signal is a reason to investigate.
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
            <p>&gt; scanning meme wreckage...</p>
            <p>&gt; past market cap: above $10M</p>
            <p>&gt; current market cap: below $500K</p>
            <p>&gt; liquidity filter required</p>
            <p>&gt; result: research signal, not financial advice</p>
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
            <h3>Every washed-up meme must survive the checks.</h3>
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
