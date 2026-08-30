const links = {
  x: 'https://x.com/awayisland',
  announcements: 'https://t.me/awayannouncements',
  community: 'https://t.me/awayisland',
};

const chapters = [
  {
    number: '01',
    label: 'The First Survivor',
    title: 'He was not flying to get rich. He was flying away.',
    text:
      'A broken trader accepts a job in New Zealand, chasing distance from rugs, deleted calls and a wallet he can no longer look at. Then the storm hits. The market crashes. The plane follows.',
  },
  {
    number: '02',
    label: 'AWAY Island',
    title: 'A forgotten station buried under palm trees.',
    text:
      'He washes ashore near an abandoned communications outpost somewhere in the South Pacific. No rescue. No map. Only wreckage, sand and antennas pointing at nothing.',
  },
  {
    number: '03',
    label: 'The Dead Terminal',
    title: 'A cracked laptop. A dead battery. A broken solar panel.',
    text:
      'The terminal does not show the full market. It wakes up for minutes, catches fragments from the wreckage and dies again before the signal becomes clear.',
  },
];

const fragments = [
  'dead charts',
  'deleted calls',
  'forgotten memes',
  'whale shadows',
  'broken wallets',
  'survivor signals',
];

const rules = [
  'No contract yet',
  'No presale',
  'No paid alpha',
  'Beware of fakes',
];

function ExternalLink({ href, children, variant = 'ghost' }) {
  return (
    <a className={`button ${variant}`} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function App() {
  return (
    <main className="site" id="top">
      <div className="grain" aria-hidden="true" />
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />

      <nav className="nav">
        <a className="brand" href="#top" aria-label="AWAY Island">
          <span className="brand-mark">A</span>
          <span className="brand-text">AWAY</span>
        </a>
        <div className="nav-links" aria-label="Main navigation">
          <a href="#origin">Origin</a>
          <a href="#terminal">Terminal</a>
          <a href="#signal">Signal</a>
          <a href="#safety">Safety</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="transmission"><span /> SIGNAL UNSTABLE · SURVIVOR ONLINE</div>
          <h1>
            We were exit liquidity.
            <em> Now we are the meme.</em>
          </h1>
          <p>
            AWAY is a cinematic meme-lore island for traders left behind by rugs, whale dumps,
            fake alpha, dead charts and the silence after every crash.
          </p>
          <div className="hero-actions">
            <ExternalLink href={links.x} variant="primary">Official X</ExternalLink>
            <ExternalLink href={links.community}>Enter the Island</ExternalLink>
          </div>
          <div className="rule-strip">
            {rules.map((rule) => <span key={rule}>{rule}</span>)}
          </div>
        </div>

        <aside className="island-scene" aria-label="AWAY Island cinematic scene">
          <div className="moon" />
          <div className="antenna" />
          <div className="palm palm-left" />
          <div className="palm palm-right" />
          <div className="survivor" />
          <div className="laptop">
            <span>THE DEAD TERMINAL</span>
            <strong>03%</strong>
            <small>signal weak but alive</small>
          </div>
          <div className="sea" />
        </aside>
      </section>

      <section className="ticker" aria-label="Signal fragments">
        {[...fragments, ...fragments].map((item, index) => (
          <span key={`${item}-${index}`}>// {item}</span>
        ))}
      </section>

      <section className="section intro-panel" id="origin">
        <p className="kicker">Chapter Zero</p>
        <h2>The market did not end. It washed ashore.</h2>
        <p className="lead">
          AWAY Island is both a place and a scar: the physical island where one survivor wakes up,
          and the emotional island where every trader lands after becoming someone else’s exit liquidity.
        </p>
      </section>

      <section className="chapter-grid">
        {chapters.map((chapter) => (
          <article className="chapter-card" key={chapter.number}>
            <div className="chapter-number">{chapter.number}</div>
            <p>{chapter.label}</p>
            <h3>{chapter.title}</h3>
            <span>{chapter.text}</span>
          </article>
        ))}
      </section>

      <section className="section terminal-section" id="terminal">
        <div className="terminal-copy">
          <p className="kicker">The Dead Terminal</p>
          <h2>It only wakes when the broken solar has enough power.</h2>
          <p>
            A cracked solar panel, an old battery from the abandoned station and a laptop pulled
            from the wreckage. The terminal does not create calls. It receives fragments.
          </p>
        </div>
        <div className="terminal-window">
          <div className="terminal-bar"><i /><i /><i /></div>
          <div className="terminal-lines">
            <p>&gt; booting from broken solar...</p>
            <p>&gt; battery unstable: 03%</p>
            <p>&gt; no internet detected</p>
            <p>&gt; market wreckage nearby</p>
            <p>&gt; weak signal received</p>
            <p>&gt; writing map in the sand...</p>
          </div>
          <div className="terminal-chart" />
        </div>
      </section>

      <section className="section signal-section" id="signal">
        <div>
          <p className="kicker">The Signal</p>
          <h2>AWAY Island has no internet. Only broken signals.</h2>
        </div>
        <div className="signal-grid">
          {fragments.map((fragment) => (
            <div className="signal-card" key={fragment}>
              <span>{fragment}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="exit-plan">
        <p>THE ISLAND HAS STARTED DRAWING A MAP.</p>
        <h2>The Exit Plan is coming.</h2>
        <span>No fake rescue. No fake alpha. No fake promises. Just survivors preparing for the next chapter.</span>
      </section>

      <section className="section safety" id="safety">
        <p className="kicker">Safety first</p>
        <h2>No contract yet. Beware of fakes.</h2>
        <p className="lead">
          Any contract claiming to be $AWAY before being posted by official AWAY channels is fake.
          There is no presale, no private allocation and no paid alpha group.
        </p>
        <div className="hero-actions center">
          <ExternalLink href={links.x} variant="primary">Official X</ExternalLink>
          <ExternalLink href={links.announcements}>Announcements</ExternalLink>
          <ExternalLink href={links.community}>Community</ExternalLink>
        </div>
      </section>

      <footer className="footer">
        <span>AWAY — the island for traders left behind.</span>
        <span>$AWAY is culture, satire and community. Crypto is high risk. No financial guarantees.</span>
      </footer>
    </main>
  );
}

export default App;
