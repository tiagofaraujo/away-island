# AWAY Island

Official experimental landing page for **AWAY** — the island where forgotten memes wash ashore.

> We were exit liquidity. Now we are the meme.

## Concept

AWAY Island has no internet. Only broken signals from the market wreckage.

The story starts with a trader who was not flying to get rich. He was flying away — a job in New Zealand, a new life, a clean start. Then the storm hit. The market crashed. The plane followed.

Somewhere in the South Pacific, AWAY Island found its first survivor.

## Core theme: AWAY Radar

AWAY is not only a meme story. The core project theme is the **AWAY Radar**:

- scan forgotten meme coins;
- look for memes that once reached strong attention;
- default filter: previous ATH market cap above `$10M` and current market cap below `$500K`;
- check liquidity, volume, holder/social survival and manipulation risk;
- classify every result as research only, never a buy call.

Signal language:

> A signal is not a call. A signal is research.

## Radar stack

Frontend:

- React + Vite
- GitHub Pages
- `src/components/Radar.jsx`
- `src/components/RadarLab.jsx`

Backend:

- Cloudflare Worker in `/worker`
- DexScreener API for current pair data
- GeckoTerminal API for OHLCV when available
- Cloudflare KV for cache/candidate shortlist when configured
- Cron Trigger every 6 hours

## Visual identity

The site uses the same cinematic orange/black AWAY identity used in X posts:

- stranded trader / survivor
- whale as market force
- broken laptop / Dead Terminal
- cracked solar / unstable power
- island map / Exit Plan
- no signal / no fake alpha / no fake rescue
- meme graveyard radar / research terminal

## Core lore elements

- **The Survivor** — the first trader left behind.
- **AWAY Island** — the place where broken traders and forgotten memes wash ashore.
- **The Dead Terminal** — a broken laptop powered by cracked solar and unstable batteries.
- **The Signal** — fragments of the market that reach the island.
- **The Whale** — the market force moving beneath the surface.
- **Baggy** — the empty wallet that survived the crash.
- **AWAY Radar** — the system that scans the meme wreckage.
- **The Exit Plan** — the next chapter of the island.

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
