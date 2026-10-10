const DEXSCREENER_BASE = 'https://api.dexscreener.com';
const GECKO_BASE = 'https://api.geckoterminal.com/api/v2';

const CORE_FILTER = {
  minimumEstimatedAthMarketCap: 10_000_000,
  maximumCurrentMarketCap: 500_000,
};

const LIVE_WINDOW_MINUTES = 120;
const MIN_KOL_CONFLUENCE = 2;

const corsHeaders = (origin = '*') => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, x-away-webhook-secret',
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      'user-agent': 'away-radar/0.3',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function chooseBestPair(pairs = [], chainId = 'solana') {
  return pairs
    .filter((pair) => !chainId || pair.chainId === chainId)
    .sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0))[0] || pairs[0];
}

async function getDexData(tokenAddress, chainId = 'solana') {
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
  } catch (_error) {
    return [];
  }
}

function estimateFromPair(pair, ohlcv) {
  const priceUsd = Number(pair.priceUsd || 0);
  const currentMarketCap = Number(pair.marketCap || pair.fdv || 0);
  const supplyEstimate = priceUsd > 0 && currentMarketCap > 0 ? currentMarketCap / priceUsd : null;
  const highs = Array.isArray(ohlcv) ? ohlcv.map((row) => Number(row?.[2] || 0)).filter(Boolean) : [];
  const maxHistoricalPrice = highs.length ? Math.max(...highs) : priceUsd;
  const estimatedAthMarketCap = supplyEstimate && maxHistoricalPrice
    ? supplyEstimate * maxHistoricalPrice
    : currentMarketCap;
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

function passesCoreFilter(result) {
  return Number(result.currentMarketCap || 0) > 0
    && Number(result.currentMarketCap || 0) <= CORE_FILTER.maximumCurrentMarketCap
    && Number(result.estimatedAthMarketCap || 0) >= CORE_FILTER.minimumEstimatedAthMarketCap;
}

function scoreSignal({ pair, estimate }) {
  const currentMc = Number(estimate.currentMarketCap || 0);
  const athMc = Number(estimate.estimatedAthMarketCap || 0);
  const liquidity = Number(pair?.liquidity?.usd || 0);
  const volume24h = Number(pair?.volume?.h24 || 0);
  const drawdown = Number(estimate.drawdownPct || 0);
  const buys = Number(pair?.txns?.h1?.buys || pair?.txns?.h24?.buys || 0);
  const sells = Number(pair?.txns?.h1?.sells || pair?.txns?.h24?.sells || 0);

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

  const txns = buys + sells;
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
  if (athMc < CORE_FILTER.minimumEstimatedAthMarketCap) risks.push('ATH threshold not confirmed');
  if (currentMc > CORE_FILTER.maximumCurrentMarketCap) risks.push('current market cap above target filter');

  return {
    score,
    verdict,
    buySellRatio: sells > 0 ? buys / sells : buys > 0 ? buys : 0,
    risk: risks.length
      ? `Main risks: ${risks.join(', ')}.`
      : 'Main risk: manual review still required for holders, bundles, deployer history and social activity.',
  };
}

async function analyzeToken({ query, tokenAddress, chainId = 'solana' }, env) {
  const chain = normalizeChain(chainId || env.DEFAULT_CHAIN || 'solana');
  const token = tokenAddress || extractTokenAddress(query);
  if (!token) throw new Error('Token address missing.');

  const cacheKey = `analysis:${chain}:${token}`;
  if (env.RADAR_CACHE) {
    const cached = await env.RADAR_CACHE.get(cacheKey, 'json');
    if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 5) return { ...cached, cached: true };
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
    volume5m: Number(pair?.volume?.m5 || 0),
    volume1h: Number(pair?.volume?.h1 || 0),
    volume24h: Number(pair?.volume?.h24 || 0),
    buys1h: Number(pair?.txns?.h1?.buys || 0),
    sells1h: Number(pair?.txns?.h1?.sells || 0),
    priceChange1h: Number(pair?.priceChange?.h1 || 0),
    priceChange24h: Number(pair?.priceChange?.h24 || 0),
    pairCreatedAt: pair.pairCreatedAt || null,
    estimatedAthMarketCap: estimate.estimatedAthMarketCap,
    drawdownPct: estimate.drawdownPct,
    passesCoreFilter: false,
    coreFilter: CORE_FILTER,
    score: scoring.score,
    verdict: scoring.verdict,
    buySellRatio: scoring.buySellRatio,
    risk: scoring.risk,
    dataQuality: ohlcv.length
      ? 'ATH is estimated from GeckoTerminal OHLCV and current supply approximation. Manual validation required.'
      : 'ATH history limited. Current data from DexScreener; manual validation required.',
    updatedAt: new Date().toISOString(),
    cachedAt: Date.now(),
  };

  result.passesCoreFilter = passesCoreFilter(result);

  if (env.RADAR_CACHE) {
    await env.RADAR_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 * 60 * 6 });
  }

  return result;
}

async function getKolRegistry(env) {
  if (!env.RADAR_CACHE) return [];
  return (await env.RADAR_CACHE.get('kols:registry', 'json')) || [];
}

function publicKol(kol) {
  return {
    id: kol.id,
    label: kol.label,
    tag: kol.tag || 'public wallet',
    score: Number(kol.score || 50),
    active: kol.active !== false,
  };
}

async function saveKolRegistry(env, items) {
  if (!env.RADAR_CACHE) throw new Error('KV not configured.');
  await env.RADAR_CACHE.put('kols:registry', JSON.stringify(items));
}

function requireAdmin(request, env) {
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(env.ADMIN_TOKEN && supplied && supplied === env.ADMIN_TOKEN);
}

function requireWebhook(request, env) {
  const supplied = request.headers.get('x-away-webhook-secret');
  return Boolean(env.WEBHOOK_SECRET && supplied && supplied === env.WEBHOOK_SECRET);
}

function inferKolEvents(payload, registry) {
  const transactions = Array.isArray(payload) ? payload : Array.isArray(payload?.transactions) ? payload.transactions : [payload];
  const byWallet = new Map(registry.filter((k) => k.active !== false).map((k) => [k.wallet, k]));
  const events = [];

  for (const tx of transactions) {
    const transfers = Array.isArray(tx?.tokenTransfers) ? tx.tokenTransfers : [];
    for (const transfer of transfers) {
      const kol = byWallet.get(transfer?.toUserAccount);
      const mint = transfer?.mint;
      if (!kol || !mint) continue;
      events.push({
        id: `${tx.signature || 'tx'}:${kol.id || kol.wallet}:${mint}`,
        signature: tx.signature || null,
        kolId: kol.id,
        kolLabel: kol.label,
        kolScore: Number(kol.score || 50),
        wallet: kol.wallet,
        tokenAddress: mint,
        tokenAmount: Number(transfer.tokenAmount || 0),
        side: 'buy',
        timestamp: tx.timestamp ? new Date(Number(tx.timestamp) * 1000).toISOString() : new Date().toISOString(),
      });
    }
  }
  return events;
}

async function appendKolEvents(env, incoming) {
  if (!env.RADAR_CACHE || !incoming.length) return [];
  const current = (await env.RADAR_CACHE.get('events:kol:recent', 'json')) || [];
  const seen = new Set(current.map((event) => event.id));
  const merged = [...incoming.filter((event) => !seen.has(event.id)), ...current]
    .filter((event) => Date.now() - new Date(event.timestamp).getTime() <= 1000 * 60 * 60 * 24)
    .slice(0, 1000);
  await env.RADAR_CACHE.put('events:kol:recent', JSON.stringify(merged), { expirationTtl: 60 * 60 * 48 });
  return merged;
}

function confluenceVerdict(score) {
  if (score >= 85) return 'Island Alert';
  if (score >= 75) return 'Strong Confluence';
  if (score >= 60) return 'Survivor Signal';
  if (score >= 40) return 'Weak Signal';
  return 'Noise';
}

async function buildConfluenceSignals(env) {
  if (!env.RADAR_CACHE) return [];
  const events = (await env.RADAR_CACHE.get('events:kol:recent', 'json')) || [];
  const cutoff = Date.now() - LIVE_WINDOW_MINUTES * 60 * 1000;
  const recent = events.filter((event) => new Date(event.timestamp).getTime() >= cutoff && event.side === 'buy');
  const grouped = new Map();

  for (const event of recent) {
    if (!grouped.has(event.tokenAddress)) grouped.set(event.tokenAddress, []);
    grouped.get(event.tokenAddress).push(event);
  }

  const signals = [];

  for (const [tokenAddress, tokenEvents] of grouped.entries()) {
    const uniqueKols = [...new Map(tokenEvents.map((event) => [event.kolId || event.wallet, event])).values()];
    if (uniqueKols.length < MIN_KOL_CONFLUENCE) continue;

    try {
      const market = await analyzeToken({ tokenAddress, chainId: 'solana' }, env);
      const avgKolScore = uniqueKols.reduce((sum, event) => sum + Number(event.kolScore || 50), 0) / uniqueKols.length;
      const timestamps = uniqueKols.map((event) => new Date(event.timestamp).getTime()).sort((a, b) => a - b);
      const spreadMinutes = Math.max(1, Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / 60000));

      let score = 0;
      score += Math.min(25, uniqueKols.length * 7);
      score += Math.min(20, Math.round(avgKolScore * 0.20));
      if (spreadMinutes <= 30) score += 15;
      else if (spreadMinutes <= 60) score += 10;
      else score += 5;
      if (market.liquidityUsd >= 50_000) score += 12;
      else if (market.liquidityUsd >= 25_000) score += 8;
      else if (market.liquidityUsd >= 10_000) score += 3;
      if (market.buySellRatio >= 1.5) score += 10;
      else if (market.buySellRatio >= 1.1) score += 6;
      if (market.volume1h >= 50_000) score += 8;
      else if (market.volume1h >= 10_000) score += 4;
      if (market.priceChange1h <= 80) score += 5;
      else if (market.priceChange1h > 150) score -= 10;
      if (market.currentMarketCap > 0 && market.currentMarketCap <= 500_000) score += 5;

      score = Math.max(0, Math.min(100, Math.round(score)));

      signals.push({
        token: market.token,
        name: market.name,
        tokenAddress,
        pairUrl: market.pairUrl,
        kolCount: uniqueKols.length,
        averageKolScore: Math.round(avgKolScore),
        windowMinutes: spreadMinutes,
        confluenceScore: score,
        verdict: confluenceVerdict(score),
        currentMarketCap: market.currentMarketCap,
        liquidityUsd: market.liquidityUsd,
        volume1h: market.volume1h,
        buySellRatio: market.buySellRatio,
        priceChange1h: market.priceChange1h,
        buyers: uniqueKols.map((event) => ({
          id: event.kolId,
          label: event.kolLabel,
          score: event.kolScore,
          timestamp: event.timestamp,
        })),
        updatedAt: new Date().toISOString(),
      });
    } catch (_error) {
      // Keep the live engine resilient if one token has no supported market pair.
    }
  }

  signals.sort((a, b) => b.confluenceScore - a.confluenceScore);
  await env.RADAR_CACHE.put('signals:live', JSON.stringify(signals.slice(0, 50)), { expirationTtl: 60 * 60 * 6 });
  return signals.slice(0, 50);
}

async function handleCandidates(env) {
  if (!env.RADAR_CACHE) {
    return { items: [], criteria: CORE_FILTER, note: 'KV not configured yet.' };
  }
  const saved = await env.RADAR_CACHE.get('candidates:latest', 'json');
  return saved || { items: [], criteria: CORE_FILTER, note: 'No scheduled scan has run yet.' };
}

async function scheduledScan(env) {
  const profiles = await fetchJson(`${DEXSCREENER_BASE}/token-profiles/latest/v1`);
  const items = [];

  for (const profile of profiles.slice(0, 60)) {
    if (!profile?.tokenAddress || !profile?.chainId) continue;
    try {
      const result = await analyzeToken({ tokenAddress: profile.tokenAddress, chainId: profile.chainId }, env);
      if (passesCoreFilter(result)) items.push(result);
    } catch (_error) {
      // Ignore unsupported or rate-limited profiles.
    }
  }

  items.sort((a, b) => b.score - a.score);
  const payload = {
    items: items.slice(0, 25),
    criteria: CORE_FILTER,
    note: 'Automated discovery from current DexScreener profiles. ATH remains an estimate until independently verified.',
    updatedAt: new Date().toISOString(),
  };

  if (env.RADAR_CACHE) {
    await env.RADAR_CACHE.put('candidates:latest', JSON.stringify(payload));
    await buildConfluenceSignals(env);
  }
  return payload;
}

export default {
  async fetch(request, env) {
    const origin = getOrigin(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) });

    const url = new URL(request.url);

    try {
      if (url.pathname === '/' || url.pathname === '/health') {
        return json({
          ok: true,
          service: 'AWAY Radar',
          version: '0.3.0',
          criteria: CORE_FILTER,
          modules: ['graveyard-radar', 'token-scan', 'kol-watch', 'confluence-engine'],
        }, 200, origin);
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

      if (url.pathname === '/api/live') {
        const signals = env.RADAR_CACHE
          ? (await env.RADAR_CACHE.get('signals:live', 'json')) || await buildConfluenceSignals(env)
          : [];
        return json({
          signals,
          note: 'Live KOL confluence. Signals are research only, not buy calls.',
          updatedAt: new Date().toISOString(),
        }, 200, origin);
      }

      if (url.pathname === '/api/kols' && request.method === 'GET') {
        const registry = await getKolRegistry(env);
        return json({ items: registry.filter((kol) => kol.active !== false).map(publicKol) }, 200, origin);
      }

      if (url.pathname === '/api/kols' && request.method === 'POST') {
        if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
        const body = await request.json();
        if (!body?.wallet || !body?.label) return json({ error: 'wallet and label are required' }, 400, origin);
        const registry = await getKolRegistry(env);
        const item = {
          id: body.id || crypto.randomUUID(),
          wallet: body.wallet,
          label: body.label,
          tag: body.tag || 'public KOL wallet',
          score: Math.max(0, Math.min(100, Number(body.score || 50))),
          active: body.active !== false,
          addedAt: new Date().toISOString(),
        };
        const next = [item, ...registry.filter((kol) => kol.wallet !== item.wallet)];
        await saveKolRegistry(env, next);
        return json({ ok: true, item: publicKol(item) }, 201, origin);
      }

      if (url.pathname === '/api/webhooks/wallets' && request.method === 'POST') {
        if (!requireWebhook(request, env)) return json({ error: 'Unauthorized webhook' }, 401, origin);
        const payload = await request.json();
        const registry = await getKolRegistry(env);
        const events = inferKolEvents(payload, registry);
        await appendKolEvents(env, events);
        const signals = await buildConfluenceSignals(env);
        return json({ ok: true, acceptedEvents: events.length, liveSignals: signals.length }, 200, origin);
      }

      if (url.pathname === '/api/run-scan') {
        if (env.ADMIN_TOKEN && !requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
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
