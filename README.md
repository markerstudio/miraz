# Miraz World — Flavor Passport

جواز سفر النكهات — the Miraz restaurant loyalty platform. Guests carry a
digital passport that only **staff** can stamp; every main course earns a
stamp, stamps climb the rewards ladder (3 → 36), and completing all six
countries unlocks the Miraz World grand rewards.

## What's in this repo

| Path | What it is |
| --- | --- |
| `apps/passport/` | Guest app — the 3D passport (React + Vite). **Read-only**: stamps appear live as staff issue them. |
| `apps/admin/` | Staff portal (React + Vite, served under `/admin`) — issue passports, scan/search guests, stamp visits, undo, reward alerts. |
| `server/` | API (Express + SQLite) — passports, stamps, staff auth, and static hosting for both apps. One deployable service. |

## Architecture

```
guest phone                     staff device
┌───────────────┐              ┌───────────────┐
│ apps/passport │  poll (4s)   │  apps/admin   │
│  read-only    │──────┐ ┌─────│  x-admin-key  │
└───────────────┘      ▼ ▼     └───────────────┘
                 ┌───────────┐
                 │  server/  │  Express + SQLite
                 │  /api/…   │  serves both apps
                 └───────────┘
```

- Guests open `https://<host>/?code=MW-XXXXX` (the QR staff hand them).
  The passport polls `GET /api/passports/:code`; when staff stamp, the
  rubber-press animation plays live on the guest's phone.
- Staff open `https://<host>/admin`, sign in with the staff key
  (`ADMIN_KEY` env var), and are the **only** writers
  (`POST /api/admin/passports/:code/stamps`).

## Run locally

```bash
# 1. API
cd server && npm install && ADMIN_KEY=miraz-dev-key npm start   # :8787

# 2. Build the apps once so the server can serve them
cd apps/passport && npm install && npm run build
cd apps/admin    && npm install && npm run build

# open http://localhost:8787/admin  (key: miraz-dev-key) → create a guest
# open http://localhost:8787/?code=MW-XXXXX  → the guest's live passport
# open http://localhost:8787/?demo=1        → demo mode (tap-to-stamp preview)
```

For frontend development with hot reload: `npm run dev` in either app and
point it at the API with `VITE_API_URL=http://localhost:8787` (admin) or
`?api=http://localhost:8787&code=…` (passport).

## Deploy (one service)

Any Node host (Render / Railway / Fly):

1. Build both apps (`npm run build` in `apps/passport` and `apps/admin`).
2. Deploy `server/` with `npm start`; it serves the API, the guest app at
   `/`, and the staff portal at `/admin`.
3. Set env vars: `ADMIN_KEY` (strong staff key — this is the only write
   credential) and `DB_PATH` on a **persistent volume** (e.g.
   `/data/miraz.db`), else stamps reset on redeploy.

Suggested Render setup: Web Service, build command
`cd apps/passport && npm ci && npm run build && cd ../admin && npm ci && npm run build && cd ../../server && npm ci`,
start command `node server/index.js` (root), disk mounted at `/data`.

## Security notes (v1)

- Staff auth is a single shared key over HTTPS — fine for one restaurant;
  move to per-staff accounts before multi-branch.
- Guest reads are public-by-code (unguessable 5-char code, 33^5 space).
  Codes are capability URLs; don't post them publicly.

## Roadmap

- QR-scan in the admin portal (camera) instead of search.
- SSE/WebSocket push instead of polling.
- Per-staff logins + audit trail (schema already records `staff` per stamp).
- Native iOS/Android wrapper (Expo) for the guest passport.
