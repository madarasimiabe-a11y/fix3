# OnePieceDaily — Frontend Deployment (Netlify)

## Quick Start

### 1. Prerequisites
- A [Netlify](https://netlify.com) account (free tier works)
- Your backend already deployed (get its URL, e.g. `https://onepiece-daily-api.onrender.com`)

### 2. Configure Backend URL

Edit `.env` (create it from `.env.example`):
```
VITE_API_URL=https://your-backend.onrender.com
```

**Important:** This env var is baked into the build at compile time.
On Netlify, set it in: Site Settings → Build & Deploy → Environment Variables.

### 3. Deploy to Netlify

**Option A — Drag & Drop (fastest)**
1. Run locally:
   ```bash
   npm install
   npm run build
   ```
2. Drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

**Option B — Git Deploy (recommended for updates)**
1. Push this `frontend` folder to a GitHub repository
2. On Netlify: Add new site → Import from Git → select repo
3. Set:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variable:** `VITE_API_URL` = your Render backend URL

The included `netlify.toml` handles SPA routing automatically.

### 4. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Full URL of your deployed backend, no trailing slash |

Example: `VITE_API_URL=https://onepiece-daily-api.onrender.com`

### 5. Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your backend URL (or http://localhost:3001 if running locally)
npm run dev
```

### 6. Features

- Daily One Piece Wordle (new word every midnight UTC)
- Green/yellow/gray tile feedback with flip animations
- Virtual keyboard + physical keyboard support
- Guest play (no account needed — stats saved locally)
- Register/Login to earn XP and appear on the leaderboard
- 9 ranks: Cabin Boy → East Blue Pirate → ... → Pirate King
- Global leaderboard (sort by XP or Wins)
- Share results to clipboard
- Mobile responsive

## Project Structure

```
src/
  App.tsx                    — root component, sets up QueryClient + AuthProvider
  main.tsx                   — React entry point
  index.css                  — One Piece dark navy theme (Cinzel gold font)
  lib/
    api.ts                   — minimal fetch client (reads VITE_API_URL)
    words.ts                 — 400+ One Piece words (4–8 letters each)
  components/
    AuthProvider.tsx          — JWT auth context (localStorage token)
    GameBoard.tsx             — 6×N tile grid with animations
    Keyboard.tsx              — on-screen keyboard
    HowToPlayModal.tsx        — rules + XP table
    StatsModal.tsx            — stats, distribution, recent history
    LeaderboardModal.tsx      — global leaderboard
    AuthModal.tsx             — login / register form
  pages/
    GamePage.tsx              — main game logic (guesses, scoring, persistence)
```
