# AWAY Radar Worker

Cloudflare Worker backend for the AWAY Radar.

## What it does

- Accepts a token address or DexScreener URL.
- Fetches current pair data from DexScreener.
- Fetches OHLCV history from GeckoTerminal when available.
- Estimates historical market cap from historical price and current supply approximation.
- Scores the signal from 0 to 100.
- Stores short-lived cache in Cloudflare KV when configured.
- Runs a scheduled scan every 6 hours when deployed with Cron Triggers.

## Important

This backend produces research signals only. It is not financial advice and it does not generate buy/sell calls.

## Deploy manually

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create RADAR_CACHE
npx wrangler kv namespace create RADAR_CACHE --preview
```

Copy the returned IDs into `wrangler.toml`, then:

```bash
npm run deploy
```

After deploy, set the frontend variable:

```bash
VITE_AWAY_RADAR_API=https://away-radar.YOUR-SUBDOMAIN.workers.dev
```

Then rebuild/redeploy the frontend.

## Endpoints

```text
GET  /health
POST /api/analyze
GET  /api/analyze?token=<TOKEN_ADDRESS>&chain=solana
GET  /api/candidates
GET  /api/run-scan
```

Example body:

```json
{
  "query": "<DexScreener URL or token address>",
  "chainId": "solana"
}
```
