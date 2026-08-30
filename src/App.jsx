const links = {
  x: 'https://x.com/awayisland',
  announcements: '#',
  community: '#',
};

const loreCards = [
  {
    eyebrow: 'Chapter 01',
    title: 'The First Survivor',
    body:
      'He was not flying to get rich. He was flying away — a job in New Zealand, a new life, a clean start. Then the storm hit. The market crashed. The plane followed.',
  },
  {
    eyebrow: 'Object Found',
    title: 'The Dead Terminal',
    body:
      'A broken laptop, a cracked solar panel and an old battery pulled from the wreckage. It does not show the full market. Only fragments left behind after everyone runs.',
  },
  {
    eyebrow: 'Transmission',
    title: 'The Signal',
    body:
      'AWAY Island has no internet. Only broken signals: dead charts, deleted calls, whale shadows and forgotten memes washing ashore.',
  },
];

const signals = ['No signal', 'No rescue', 'No fake alpha', 'No contract yet'];

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function App() {
  return (
    <main className="site-shell">
      <div className="noise" />
      <nav className="nav">
        <a className="brand" href="#top" aria-label="AWAY Island home">
          <span className="brand-mark">A</span>
          <span>AWAY</span>
        </a>
        <div className="nav-links">
          <a href="#lore">Lore</a>
          <a href="#signal">Signal</a>
          <a href="#safety">Safety</a>
        </div>
      </nav>

      <section id="top" className="hero section-grid">
        <div className="hero-copy">
          <div className="status-line">
            <span className="pulse" />
            Signal unstable · survivor online
          </div>
          <h1>
            We were exit liquidity.
            <span> Now we are the meme.</span>
          </h1>
          <p className="hero-text">
            AWAY is the island for traders left behind — the broken bags, the deleted calls,
            the dead charts and the survivors still listening for a signal.
          </p>

          <div className="hero-actions">
            <a href={links.announcements} className="button primary">
              Official Announcements
            </a>
            <a href={links.community} className="button ghost">
              Enter AWAY Island
            </a>
          </div>

          <div className="badge-row">
            <Badge>No presale</Badge>
            <Badge>No paid alpha</Badge>
            <Badge>Beware of fakes</Badge>
          </div>
        </div>

        <div className="terminal-card" aria-label="The Dead Terminal interface">
          <div className="terminal-top">
            <span />
            <span />
            <span />
          </div>
          <div className="terminal-screen">
            <p className="terminal-label">THE DEAD TERMINAL</p>
            <div className="chart-line" />
            <div className="terminal-output">
              <p>&gt; Booting from broken solar...</p>
              <p>&gt; Battery unstable: 03%</p>
              <p>&gt; Market wreckage detected</p>
              <p>&gt; Signal: weak but alive</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="AWAY signals ticker">
        {signals.concat(signals).map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </section>

      <section id="lore" className="section lore-section">
        <div className="section-heading">
          <p className="kicker">The origin</p>
          <h2>He was not flying to get rich. He was flying away.</h2>
          <p>
            A trader broken by rugs and dead bags takes a flight toward a new life. Somewhere
            over the South Pacific, the storm turns financial collapse into survival lore.
          </p>
        </div>

        <div className="cards-grid">
          {loreCards.map((card) => (
            <article className="lore-card" key={card.title}>
              <p>{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <span>{card.body}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="signal" className="section signal-section section-grid">
        <div>
          <p className="kicker">The Signal</p>
          <h2>AWAY Island has no internet. Only fragments.</h2>
          <p>
            Cracked phones washing ashore. Dead charts in broken laptops. Radio signals from
            deleted group chats. Whale shadows crossing the sea. Memes appearing on the horizon.
          </p>
        </div>
        <div className="signal-map">
          <div className="island-core">AWAY<br />ISLAND</div>
          <span className="map-dot one" />
          <span className="map-dot two" />
          <span className="map-dot three" />
          <span className="route" />
        </div>
      </section>

      <section className="manifesto">
        <p>No fake rescue.</p>
        <p>No fake alpha.</p>
        <p>No fake promises.</p>
        <strong>Just survivors preparing for the next chapter.</strong>
      </section>

      <section id="safety" className="section safety-section">
        <div className="section-heading compact">
          <p className="kicker">Safety first</p>
          <h2>No contract yet. Beware of fakes.</h2>
          <p>
            Any contract claiming to be $AWAY before being posted by official AWAY channels is fake.
            There is no presale, no private allocation and no paid alpha group.
          </p>
        </div>
        <div className="official-links">
          <a href={links.x}>Official X</a>
          <a href={links.announcements}>Announcements</a>
          <a href={links.community}>Community</a>
        </div>
      </section>

      <footer className="footer">
        <p>$AWAY is culture, satire and community. Crypto is high risk. No financial guarantees.</p>
        <p>AWAY — The island for traders left behind.</p>
      </footer>
    </main>
  );
}

export default App;
