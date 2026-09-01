import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_AWAY_RADAR_API || 'https://away-radar.YOUR-CLOUDFLARE-SUBDOMAIN.workers.dev';

function formatUsd(value) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return `${value.toFixed(1)}%`;
}

function MemeShortlist() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Waiting for live backend. Deploy the Cloudflare Worker to activate automatic discovery.');
  const [updatedAt, setUpdatedAt] = useState(null);
  const isPlaceholder = useMemo(() => API_BASE.includes('YOUR-CLOUDFLARE-SUBDOMAIN'), []);

  useEffect(() => {
    if (isPlaceholder) return;

    async function loadCandidates() {
      try {
        setStatus('Loading latest AWAY Radar shortlist...');
        const response = await fetch(`${API_BASE}/api/candidates`);
        if (!response.ok) throw new Error(`Shortlist error ${response.status}`);
        const data = await response.json();
        setItems(Array.isArray(data.items) ? data.items : []);
        setUpdatedAt(data.updatedAt || null);
        setStatus(data.note || 'Only memes matching both filters appear here.');
      } catch (error) {
        setStatus(error.message || 'Could not load the live shortlist.');
      }
    }

    loadCandidates();
  }, [isPlaceholder]);

  const visibleItems = items.slice(0, 12);

  return (
    <section id="shortlist" className="section shortlist-section">
      <div className="section-heading center">
        <p className="eyebrow">Live Shortlist</p>
        <h2>Memes that had an ATH above $10M and now sit below $500K.</h2>
        <p>
          This is the central pillar of AWAY: a strict research list of washed-up memes
          that once had real attention and are now deep in the wreckage. No token appears
          here unless it passes the two core market-cap gates.
        </p>
      </div>

      <div className="shortlist-rules" aria-label="AWAY Radar core rules">
        <span>ATH MC &gt; $10M</span>
        <span>Current MC &lt; $500K</span>
        <span>Liquidity reviewed</span>
        <span>Signal ≠ Call</span>
      </div>

      <div className="shortlist-card">
        <div className="shortlist-head">
          <div>
            <small>AWAY Radar Output</small>
            <h3>Forgotten Meme List</h3>
          </div>
          <div className="shortlist-meta">
            <span>{visibleItems.length} candidates</span>
            <span>{updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : 'Live mode pending'}</span>
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="shortlist-table-wrap">
            <table className="shortlist-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Current MC</th>
                  <th>Est. ATH MC</th>
                  <th>Drawdown</th>
                  <th>Liquidity</th>
                  <th>24h Vol.</th>
                  <th>Score</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={`${item.chainId}-${item.tokenAddress || item.pairAddress || item.token}`}>
                    <td>
                      <strong>{item.token || item.symbol || 'Unknown'}</strong>
                      <span>{item.name || item.chainId || 'solana'}</span>
                    </td>
                    <td>{formatUsd(item.currentMarketCap)}</td>
                    <td>{formatUsd(item.estimatedAthMarketCap)}</td>
                    <td>{formatPercent(item.drawdownPct)}</td>
                    <td>{formatUsd(item.liquidityUsd)}</td>
                    <td>{formatUsd(item.volume24h)}</td>
                    <td><b>{item.score ?? '—'}/100</b></td>
                    <td>{item.verdict || 'Research'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="shortlist-empty">
            <strong>No live candidates yet.</strong>
            <p>{status}</p>
            <p>
              Next build step: deploy the Worker, run the scanner, then only tokens that pass
              ATH &gt; $10M and current MC &lt; $500K will populate this list.
            </p>
          </div>
        )}

        <div className="shortlist-disclaimer">
          A listed token is not a buy signal. It only means the token deserves deeper manual research.
        </div>
      </div>
    </section>
  );
}

export default MemeShortlist;
