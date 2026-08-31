const DEXSCREENER_BASE = 'https://api.dexscreener.com';
const GECKO_BASE = 'https://api.geckoterminal.com/api/v2';

const corsHeaders = (origin = '*') => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
  'access-control-max-age': '86400',
});

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}

function getOrigin(request, env) {
  const origin = request.headers.get('origin');
  const allowed = env.ALLOWED_ORIGIN || '*';
  if (!origin || allowed === '*') return '*';
  return origin.startsWith(allowed) ? origin : allowed;
}

function extractTokenAddress(input) {
  if (!input) return '';
  const text = String(input).trim();
  const match = text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
  return match ? match[0] : text;
}

function normalizeChain(chainId = 'solana') {
  const chain = String(chainId || 'solana').toLowerCase();
  if (chain === 'sol') return 'solana';
  if (chain === 'eth') return 'ethereum';
  if (chain === 'base') return 'base';
  if (chain === 'bsc') return 'bsc';
  return chain;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'accept': 'application/json', 'user-agent': 'away-radar/0.1' },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function chooseBestPair(pairs = [], chainId = 'solana') {
  return pairs
    .filter((pair) => !chainId || pair.chainId === chainId)
    .sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0))[0] || pairs[0];
}

async function getDexData(tokenAddress, chainId) {
  const data = await fetchJson(`${DEXSCREENER_BASE}/latest/dex/tokens/${tokenAddress}`);
  const pair = chooseBestPair(data.pairs || [], chainId);
  if (!pair) throw new Error('No DexScreener pair found for token.');
  return { raw: data, pair };
}

async function getGeckoOhlcv(network, poolAddress) {
  try {
    const url = `${GECKO_BASE}/networks/${network}/pools/${poolAddress}/ohlcv/day?aggregate=1&limit=1000`;
    const data = await fetchJson(url);
    return data?.data?.attributes?.ohlcv_list || [];
  } catch (error) {
    return [];
  }
}

function estimateFromPair(pair, ohlcv) {
  const priceUsd = Number(pair.priceUsd || 0);
  const currentMarketCap = Number(pair.marketCap || pair.fdv || 0);
  const supplyEstimate = priceUsd > 0 && currentMarketCap > 0 ? currentMarketCap / priceUsd : null;
  const highs = Array.isArray(ohlcv) ? ohlcv.map((row) => Number(row?.[2] || 0)).filter(Boolean) : [];
  const maxHistoricalPrice = highs.length ? Math.max(...highs) : priceUsd;
  const estimatedAthMarketCap = supplyEstimate && maxHistoricalPrice ? supplyEstimate * maxHistoricalPrice : currentMarketCap;
  const drawdownPct = estimatedAthMarketCap > 0 && currentMarketCap > 0
    ? Math.max(0, Math.min(100, (1 - currentMarketCap / estimatedAthMarketCap) * 100))
    : null;

  return {
    priceUsd,
    currentMarketCap,
    supplyEstimate,
    maxHistoricalPrice,
    estimatedAthMarketCap,
    drawdownPct,
  };
}

function scoreSignal({ pair, estimate }) {
  const currentMc = Number(estimate.currentMarketCap || 0);
  const athMc = Number(estimate.estimatedAthMarketCap || 0);
  const liquidity = Number(pair?.liquidity?.usd || 0);
  const volume24h = Number(pair?.volume?.h24 || 0);
  const drawdown = Number(estimate.drawdownPct || 0);

  let score = 0;
  if (athMc >= 10_000_000) score += 20;
  else if (athMc >= 5_000_000) score += 10;

  if (currentMc > 0 && currentMc <= 500_000) score += 18;
  else if (currentMc <= 1_000_000) score += 9;

  if (drawdown >= 95) score += 18;
  else if (drawdown >= 85) score += 12;
  else if (drawdown >= 70) score += 6;

  if (liquidity >= 75_000) score += 16;
  else if (liquidity >= 25_000) score += 10;
  else if (liquidity >= 10_000) score += 4;

  if (volume24h >= 100_000) score += 14;
  else if (volume24h >= 25_000) score += 8;
  else if (volume24h >= 5_000) score += 4;

  const txns = Number(pair?.txns?.h24?.buys || 0) + Number(pair?.txns?.h24?.sells || 0);
  if (txns >= 300) score += 8;
  else if (txns >= 80) score += 5;
  else if (txns >= 20) score += 2;

  if (liquidity > 0 && volume24h / liquidity > 0.5) score += 6;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let verdict = 'Dead Wreck';
  if (score >= 75) verdict = 'Island Alert';
  else if (score >= 60) verdict = 'Survivor Signal';
  else if (score >= 40) verdict = 'Weak Signal';

  const risks = [];
  if (liquidity < 25_000) risks.push('low liquidity');
  if (volume24h < 5_000) risks.push('weak 24h volume');
  if (athMc < 10_000_000) risks.push('ATH threshold not confirmed');
  if (currentMc > 500_000) risks.push('current market cap above target filter');

  return {
    score,
    verdict,
    risk: risks.length ? `Main risks: ${risks.join(', ')}.` : 'Main risk: manual review still required for holders, bundles and social activity.',
  };
}

async function analyzeToken({ query, tokenAddress, chainId = 'solana' }, env) {
  const chain = normalizeChain(chainId || env.DEFAULT_CHAIN || 'solana');
  const token = tokenAddress || extractTokenAddress(query);
  if (!token) throw new Error('Token address missing.');

  const cacheKey = `analysis:${chain}:${token}`;
  if (env.RADAR_CACHE) {
    const cached = await env.RADAR_CACHE.get(cacheKey, 'json');
    if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 15) return { ...cached, cached: true };
  }

  const { pair } = await getDexData(token, chain);
  const ohlcv = await getGeckoOhlcv(chain, pair.pairAddress);
  const estimate = estimateFromPair(pair, ohlcv);
  const scoring = scoreSignal({ pair, estimate });

  const result = {
    token: pair.baseToken?.symbol || token,
    name: pair.baseToken?.name || '',
    tokenAddress: pair.baseToken?.address || token,
    chainId: chain,
    dexId: pair.dexId,
    pairAddress: pair.pairAddress,
    pairUrl: pair.url,
    priceUsd: estimate.priceUsd,
    currentMarketCap: estimate.currentMarketCap,
    liquidityUsd: Number(pair?.liquidity?.usd || 0),
    volume24h: Number(pair?.volume?.h24 || 0),
    txns24h: Number(pair?.txns?.h24?.buys || 0) + Number(pair?.txns?.h24?.sells || 0),
    estimatedAthMarketCap: estimate.estimatedAthMarketCap,
    drawdownPct: estimate.drawdownPct,
    score: scoring.score,
    verdict: scoring.verdict,
    risk: scoring.risk,
    dataQuality: ohlcv.length
      ? 'ATH is estimated from GeckoTerminal OHLCV and current supply approximation. Manual validation required.'
      : 'ATH history limited. Current data from DexScreener; manual validation required.',
    updatedAt: new Date().toISOString(),
    cachedAt: Date.now(),
  };

  if (env.RADAR_CACHE) {
    await env.RADAR_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 * 60 * 6 });
  }

  return result;
}

async function handleCandidates(env) {
  if (!env.RADAR_CACHE) return { items: [], note: 'KV not configured yet.' };
  const saved = await env.RADAR_CACHE.get('candidates:latest', 'json');
  return saved || { items: [], note: 'No scheduled scan has run yet.' };
}

async function scheduledScan(env) {
  const profiles = await fetchJson(`${DEXSCREENER_BASE}/token-profiles/latest/v1`);
  const items = [];
  for (const profile of profiles.slice(0, 40)) {
    if (!profile?.tokenAddress || !profile?.chainId) continue;
    try {
      const result = await analyzeToken({ tokenAddress: profile.tokenAddress, chainId: profile.chainId }, env);
      if (result.currentMarketCap <= 500_000 || result.estimatedAthMarketCap >= 10_000_000) {
        items.push(result);
      }
    } catch (_error) {
      // Ignore weak or unsupported profiles.
    }
  }
  items.sort((a, b) => b.score - a.score);
  const payload = { items: items.slice(0, 25), updatedAt: new Date().toISOString() };
  if (env.RADAR_CACHE) await env.RADAR_CACHE.put('candidates:latest', JSON.stringify(payload));
  return payload;
}

export default {
  async fetch(request, env) {
    const origin = getOrigin(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) });

    const url = new URL(request.url);

    try {
      if (url.pathname === '/' || url.pathname === '/health') {
        return json({ ok: true, service: 'AWAY Radar', version: '0.1.0' }, 200, origin);
      }

      if (url.pathname === '/api/analyze') {
        const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
        const result = await analyzeToken({
          query: body.query || url.searchParams.get('q') || url.searchParams.get('token'),
          tokenAddress: body.tokenAddress || url.searchParams.get('tokenAddress'),
          chainId: body.chainId || url.searchParams.get('chain') || env.DEFAULT_CHAIN,
        }, env);
        return json(result, 200, origin);
      }

      if (url.pathname === '/api/candidates') {
        return json(await handleCandidates(env), 200, origin);
      }

      if (url.pathname === '/api/run-scan') {
        return json(await scheduledScan(env), 200, origin);
      }

      return json({ error: 'Not found' }, 404, origin);
    } catch (error) {
      return json({ error: error.message || 'AWAY Radar error' }, 500, origin);
    }
  },

  async scheduled(_controller, env, _ctx) {
    await scheduledScan(env);
  },
};
