# AWAY Island

Official experimental landing page for **AWAY** — the island where forgotten memes wash ashore.

> We were exit liquidity. Now we are the meme.

## Core product

AWAY is now simplified around one central pillar: the **AWAY Radar shortlist**.

The first target list is strict:

- previous estimated ATH market cap above `$10M`;
- current market cap below `$500K`;
- liquidity and volume reviewed before any deeper research;
- every output is research only, never a buy call.

Signal language:

> A signal is not a call. A signal is research.

## Site structure

The site has been simplified. The standalone Terminal and Signal sections were removed from the main page to keep the project focused.

Current sections:

- Hero
- Story
- AWAY Radar thesis
- Forgotten Meme Shortlist
- Manual Scan Lab
- Exit Plan
- Community
- Safety
- Footer

## Radar stack

Frontend:

- React + Vite
- GitHub Pages
- `src/components/Radar.jsx`
- `src/components/MemeShortlist.jsx`
- `src/components/RadarLab.jsx`

Backend:

- Cloudflare Worker in `/worker`
- DexScreener API for current pair data
- GeckoTerminal API for OHLCV when available
- Cloudflare KV for cache/candidate shortlist when configured
- Cron Trigger every 6 hours

## Worker endpoints

```text
GET  /health
POST /api/analyze
GET  /api/analyze?token=<TOKEN_ADDRESS>&chain=solana
GET  /api/candidates
GET  /api/run-scan
```

`/api/candidates` only returns tokens that pass both core filters when the scheduled scanner has data:

```text
estimatedAthMarketCap >= 10000000
currentMarketCap <= 500000
```

## Visual identity

The site uses the same cinematic orange/black AWAY identity used in X posts:

- island/survivor/whale visual language;
- market wreckage and forgotten memes;
- no fake alpha, no fake rescue;
- research-first radar.

## Safety

No contract yet. No presale. No private allocation. No paid alpha group. Beware of fakes.

Any contract claiming to be `$AWAY` before being posted by official AWAY channels is fake.

## Frontend development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

## Cloudflare Worker

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create RADAR_CACHE
npx wrangler kv namespace create RADAR_CACHE --preview
```

Copy the KV IDs into `worker/wrangler.toml`, then:

```bash
npm run deploy
```

After deploy, configure the frontend API URL:

```bash
VITE_AWAY_RADAR_API=https://away-radar.YOUR-SUBDOMAIN.workers.dev
```

## GitHub Pages

Expected URL:

```text
https://tiagofaraujo.github.io/away-island/
```

## Disclaimer

`$AWAY` is culture, satire and community. Crypto is high risk. No financial guarantees. The radar produces research signals only, not financial advice or buy/sell recommendations.
