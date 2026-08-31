import { useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_AWAY_RADAR_API || 'https://away-radar.YOUR-CLOUDFLARE-SUBDOMAIN.workers.dev';

const demoResult = {
  token: 'DEMO',
  chainId: 'solana',
  currentMarketCap: 420000,
  liquidityUsd: 68500,
  volume24h: 128000,
  estimatedAthMarketCap: 14300000,
  drawdownPct: 97.1,
  score: 72,
  verdict: 'Survivor Signal',
  risk: 'Liquidity and holder concentration still need manual review.',
  dataQuality: 'Demo only — connect Cloudflare Worker for live analysis.',
};

function formatUsd(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function RadarLab() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(demoResult);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('Live mode activates when the Cloudflare Worker URL is configured.');

  const isPlaceholder = useMemo(() => API_BASE.includes('YOUR-CLOUDFLARE-SUBDOMAIN'), []);

  async function analyze(event) {
    event.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setNotice('Paste a Solana token address or DexScreener URL first.');
      return;
    }

    if (isPlaceholder) {
      setResult({ ...demoResult, token: 'PASTE READY', dataQuality: 'Worker URL not configured yet. Demo scoring shown.' });
      setNotice('Backend code is ready in /worker. Deploy it on Cloudflare and set VITE_AWAY_RADAR_API to activate live mode.');
      return;
    }

    setLoading(true);
    setNotice('Scanning the wreckage...');
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery, chainId: 'solana' }),
      });
      if (!response.ok) throw new Error(`Radar error ${response.status}`);
      const data = await response.json();
      setResult(data);
      setNotice('Signal received. Treat this as research, not a buy call.');
    } catch (error) {
      setNotice(error.message || 'Radar failed. Try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="radar-lab" className="section radar-lab-section">
      <div className="section-heading center">
        <p className="eyebrow">AWAY Radar v0.1</p>
        <h2>Paste a meme. Let the island scan the wreckage.</h2>
        <p>
          The first automated layer checks current market cap, liquidity, 24h volume,
          estimated historical market cap and drawdown. It does not decide for you.
          It only tells you whether the signal deserves deeper research.
        </p>
      </div>

      <div className="radar-lab-grid">
        <form className="scan-card" onSubmit={analyze}>
          <label htmlFor="radar-query">Token address or DexScreener URL</label>
          <textarea
            id="radar-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Example: paste Solana token address or DexScreener pair URL"
          />
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Scanning...' : 'Scan with AWAY Radar'}
          </button>
          <p className="scan-notice">{notice}</p>
        </form>

        <div className="result-card">
          <div className="result-head">
            <div>
              <small>{result.chainId || 'solana'}</small>
              <h3>{result.token || result.symbol || 'Unknown Meme'}</h3>
            </div>
            <strong>{result.score ?? '—'}/100</strong>
          </div>
          <div className="result-grid">
            <span>Current MC <b>{formatUsd(result.currentMarketCap)}</b></span>
            <span>Liquidity <b>{formatUsd(result.liquidityUsd)}</b></span>
            <span>24h Volume <b>{formatUsd(result.volume24h)}</b></span>
            <span>Est. ATH MC <b>{formatUsd(result.estimatedAthMarketCap)}</b></span>
            <span>Drawdown <b>{typeof result.drawdownPct === 'number' ? `${result.drawdownPct.toFixed(1)}%` : '—'}</b></span>
            <span>Verdict <b>{result.verdict || '—'}</b></span>
          </div>
          <p className="risk-line">{result.risk || 'Risk review required.'}</p>
          <p className="quality-line">{result.dataQuality || 'Data quality depends on API coverage and liquidity.'}</p>
        </div>
      </div>
    </section>
  );
}

export default RadarLab;
