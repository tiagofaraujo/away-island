import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_AWAY_RADAR_API || 'https://away-radar.YOUR-CLOUDFLARE-SUBDOMAIN.workers.dev';

function badgeClass(verdict = '') {
  const v = verdict.toLowerCase();
  if (v.includes('island alert')) return 'signal-badge hot';
  if (v.includes('strong')) return 'signal-badge strong';
  if (v.includes('survivor')) return 'signal-badge survivor';
  return 'signal-badge';
}

function formatUsd(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
  }).format(value);
}

export default function KolWatch() {
  const [signals, setSignals] = useState([]);
  const [kols, setKols] = useState([]);
  const [status, setStatus] = useState('Backend pending — the interface is ready for live wallet events.');
  const [updatedAt, setUpdatedAt] = useState(null);
  const isPlaceholder = useMemo(() => API_BASE.includes('YOUR-CLOUDFLARE-SUBDOMAIN'), []);

  useEffect(() => {
    if (isPlaceholder) return undefined;

    let active = true;
    let timer;

    async function refresh() {
      try {
        const [signalsRes, kolsRes] = await Promise.all([
          fetch(`${API_BASE}/api/live`),
          fetch(`${API_BASE}/api/kols`),
        ]);

        if (!signalsRes.ok) throw new Error(`Live radar error ${signalsRes.status}`);
        const signalData = await signalsRes.json();
        const kolData = kolsRes.ok ? await kolsRes.json() : { items: [] };

        if (!active) return;
        setSignals(Array.isArray(signalData.signals) ? signalData.signals : []);
        setKols(Array.isArray(kolData.items) ? kolData.items : []);
        setUpdatedAt(signalData.updatedAt || new Date().toISOString());
        setStatus(signalData.note || 'Watching the island for independent wallet confluence.');
      } catch (error) {
        if (active) setStatus(error.message || 'Could not refresh live signals.');
      }

      if (active) timer = setTimeout(refresh, 30000);
    }

    refresh();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isPlaceholder]);

  const visibleSignals = signals.slice(0, 8);
  const visibleKols = kols.slice(0, 8);

  return (
    <section id="kol-watch" className="section kol-watch-section">
      <div className="section-heading center">
        <p className="eyebrow">KOL Watch · Confluence Engine</p>
        <h2>One wallet is noise. Independent buyers become a signal.</h2>
        <p>
          AWAY watches public wallets, measures who entered first and only upgrades a signal
          when market structure confirms the move. No auto-buy. No copy-trading. Research only.
        </p>
      </div>

      <div className="kol-summary-grid">
        <div className="metric-card"><small>Tracked KOLs</small><strong>{kols.length}</strong></div>
        <div className="metric-card"><small>Live Signals</small><strong>{signals.length}</strong></div>
        <div className="metric-card"><small>Refresh</small><strong>30s</strong></div>
        <div className="metric-card"><small>Alert Rule</small><strong>2+ KOLs</strong></div>
      </div>

      <div className="kol-layout">
        <article className="live-panel">
          <div className="panel-head">
            <div>
              <small>LIVE</small>
              <h3>Signal Confluence</h3>
            </div>
            <span className="status-dot">●</span>
          </div>

          {visibleSignals.length ? (
            <div className="signal-list">
              {visibleSignals.map((signal) => (
                <div className="live-signal-row" key={signal.tokenAddress || signal.token}>
                  <div className="signal-token">
                    <strong>${signal.token || 'TOKEN'}</strong>
                    <span>{signal.kolCount || 0} KOLs · {signal.windowMinutes || 60}m</span>
                  </div>
                  <div className="signal-market">
                    <span>MC <b>{formatUsd(signal.currentMarketCap)}</b></span>
                    <span>Liq <b>{formatUsd(signal.liquidityUsd)}</b></span>
                  </div>
                  <div className="signal-score">
                    <b>{signal.confluenceScore ?? '—'}</b>
                    <span>/100</span>
                  </div>
                  <span className={badgeClass(signal.verdict)}>{signal.verdict || 'Watching'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="live-empty">
              <strong>No verified KOL confluence yet.</strong>
              <p>{status}</p>
              <p>The list populates automatically after tracked wallets generate events.</p>
            </div>
          )}

          <div className="panel-foot">
            {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : 'Waiting for live backend'}
          </div>
        </article>

        <article className="kol-panel">
          <div className="panel-head">
            <div>
              <small>WATCHLIST</small>
              <h3>KOL Reliability</h3>
            </div>
          </div>

          {visibleKols.length ? (
            <div className="kol-list">
              {visibleKols.map((kol) => (
                <div className="kol-row" key={kol.id || kol.label}>
                  <div>
                    <strong>{kol.label || 'Tracked Wallet'}</strong>
                    <span>{kol.tag || 'public wallet'}</span>
                  </div>
                  <div className="kol-score">
                    <b>{kol.score ?? '—'}</b><span>/100</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="live-empty">
              <strong>Wallet registry ready.</strong>
              <p>Add only public KOL wallets with a measurable trading history.</p>
            </div>
          )}

          <div className="kol-rules">
            <span>Early buy ↑</span>
            <span>Late buy ↓</span>
            <span>Related wallets ↓</span>
            <span>Smart-money confirmation ↑</span>
          </div>
        </article>
      </div>

      <div className="signal-principle">
        <strong>AWAY rule:</strong> a KOL purchase is never enough on its own. The signal strengthens only when independent wallets, liquidity, volume and market structure align.
      </div>
    </section>
  );
}
