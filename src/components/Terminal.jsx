import { terminalLines } from '../data/content.js';

function Terminal() {
  return (
    <section id="terminal" className="section terminal-section split-layout reverse">
      <div className="terminal-panel" aria-label="The Dead Terminal">
        <div className="terminal-window">
          <div className="terminal-top"><span /><span /><span /></div>
          <p className="terminal-name">THE DEAD TERMINAL</p>
          <div className="terminal-chart" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span />
          </div>
          <div className="terminal-lines">
            {terminalLines.map((line) => <p key={line}>{line}</p>)}
          </div>
        </div>
      </div>
      <div className="section-copy">
        <p className="eyebrow">Broken solar · unstable battery</p>
        <h2>The market only reaches the island in fragments.</h2>
        <p>
          A broken laptop. A cracked solar panel. A weak signal from nowhere.
          Sometimes the island catches fragments of the market. Never the full chart.
          Always enough to keep hope alive.
        </p>
        <div className="feature-list">
          <span>Broken Solar</span>
          <span>Dead Terminal</span>
          <span>Last Antenna</span>
        </div>
      </div>
    </section>
  );
}

export default Terminal;
