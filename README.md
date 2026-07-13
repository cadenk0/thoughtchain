# ThoughtChain

A daily word association game with two modes: **Bridge** (get from one word to another in 4 moves) and **Endless** (chain as far as you can).

---

## Running the app

### Development (with hot reload)
```bash
npm install
npm run dev
```
Open http://localhost:3000

### Production
```bash
npm install
npm run build
npm start
```

### One-command launch (build + start)
```bash
npm install
npm run launch
```

---

## Environment variables

Create a `.env.local` file in the project root:

```env
# Nothing required — the app runs fully without any keys.
# Datamuse API is free and requires no authentication.
```

---

## How it works

- **Bridge mode**: Each day a 4-step path is generated through word associations using Datamuse. Players must find a path from the start word to the target word in 4 moves or fewer.
- **Endless mode**: Starting from the same word as bridge, chain as many associations as you can. One wrong guess ends your run.
- **Associations**: Powered by [Datamuse API](https://www.datamuse.com/api/) — free, no key needed. Results are cached to disk in `data/association-cache.json` so repeated lookups are instant.
- **Archive**: Past puzzles accumulate day by day from the launch date. Empty on day 1.
- **Leaderboard**: In-memory by default (resets on restart). Add Upstash Redis env vars for persistence across deploys.

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

No environment variables required. The Datamuse API is called server-side and works without any credentials.
