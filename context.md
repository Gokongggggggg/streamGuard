# StreamGuard — Project Context

## Overview
StreamGuard adalah donation spam filter untuk live streamer Indonesia. Memfilter donasi yang mengandung promosi judi online (judol), pinjol, dan spam lainnya dari platform donasi seperti Saweria dan Trakteer sebelum ditampilkan di OBS overlay.

**Version:** 0.2.0 (Multi-user + Database)
**Tech Stack:** Node.js + Express + PostgreSQL + WebSocket + React (Vite)
**Port:** 3000 (server), 5173 (Vite dev)

---

## Architecture

```
Client (Saweria/Trakteer) → Webhook → Server → Filter Pipeline → DB
                                                    ↓ (if passed)
                                              WebSocket → OBS Overlay
```

### Flow:
1. Saweria/Trakteer mengirim webhook ke `/webhook/saweria/:token` atau `/webhook/trakteer/:token`
2. Server lookup user berdasarkan `webhook_token`
3. Donation masuk ke `processDonation()` — filter pipeline:
   - Layer 1: Text normalization (leetspeak decode, remove separators, dedupe chars)
   - Layer 2a: Custom blocklist per user
   - Layer 2b: Keyword matching (JUDOL_KEYWORDS)
   - Layer 2c: Regex pattern matching (JUDOL_PATTERNS)
   - Layer 3: ML classification (TODO, belum diimplementasi)
4. Hasil disimpan ke DB (passed maupun blocked)
5. Jika passed → broadcast via WebSocket ke overlay OBS user tersebut
6. Jika blocked → log, bisa di-approve manual dari dashboard

---

## File Structure

### Backend (Root)
| File | Fungsi |
|------|--------|
| `server.js` | Main server: Express + WS + semua routes (413 lines) |
| `providers/saweria.js` | Parse webhook Saweria, verify HMAC signature |
| `providers/trakteer.js` | Parse webhook Trakteer (simple, no signature verification) |
| `filters/judolFilter.js` | NLP filter pipeline: normalize → keyword → regex |
| `db/pool.js` | PostgreSQL connection pool (shared) |
| `db/init.js` | Schema creation script (`node db/init.js`) |
| `db/userModel.js` | User CRUD: register, login (bcryptjs), find by token/id, toggle filter |
| `db/donationModel.js` | Donation CRUD: save, get (all/blocked/passed), stats, approve |
| `db/blocklistModel.js` | Per-user custom blocklist CRUD |
| `public/overlay.html` | OBS overlay page: WebSocket client + donation alert animation |

### Frontend — Dashboard (`dashboard/`)
| File | Fungsi |
|------|--------|
| `package.json` | React 19 + Vite 6 |
| `vite.config.js` | Proxy `/api`, `/webhook`, `/test`, `/overlay`, `/health` ke :3000 |
| `index.html` | SPA entry point, DM Sans font |
| `src/main.jsx` | React root render |
| `src/App.jsx` | **Single-file dashboard** (~1200 lines): login/register, donation list, blocklist, settings, stats, test donation. All inline styles with theme object `T`. |

---

## Database Schema (PostgreSQL)

### `users`
- `id` SERIAL PK
- `email` VARCHAR(255) UNIQUE
- `password_hash` VARCHAR(255) — bcryptjs, 10 salt rounds
- `username` VARCHAR(100)
- `webhook_token` VARCHAR(64) UNIQUE — UUID tanpa dash
- `overlay_token` VARCHAR(64) UNIQUE — UUID tanpa dash
- `filter_enabled` BOOLEAN DEFAULT true
- `created_at`, `updated_at` TIMESTAMP

### `donations`
- `id` SERIAL PK
- `user_id` INTEGER FK → users
- `provider` VARCHAR(50) — 'saweria', 'trakteer', 'test'
- `donation_id`, `donator_name`, `amount`, `message`
- `blocked` BOOLEAN, `filter_reason`, `filter_layer`, `confidence`
- `manually_approved` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP

### `blocklist`
- `id` SERIAL PK
- `user_id` INTEGER FK → users
- `word` VARCHAR(255)
- UNIQUE(user_id, word)

Indexes: `idx_donations_user_id`, `idx_donations_blocked`, `idx_donations_created`, `idx_blocklist_user_id`

---

## API Endpoints

### Auth (no auth required)
- `POST /api/auth/register` — `{email, password, username}` → returns user + webhook/overlay URLs
- `POST /api/auth/login` — `{email, password}` → returns user + tokens

### Protected (requires `x-user-id` header) — **Note: no JWT, just user ID header**
- `GET /api/me` — user info + donation stats
- `GET /api/donations` — all donations (limit 50)
- `GET /api/donations/blocked` — blocked only
- `GET /api/donations/passed` — passed only
- `POST /api/donations/:id/approve` — approve false positive, send to overlay
- `POST /api/settings/filter` — `{enabled: bool}` toggle filter
- `GET /api/blocklist` — get custom words
- `POST /api/blocklist` — `{word}` add word
- `DELETE /api/blocklist/:word` — remove word

### Webhooks (token-based)
- `POST /webhook/saweria/:webhookToken`
- `POST /webhook/trakteer/:webhookToken`

### Utility
- `GET /health` — server status
- `POST /test/donation/:webhookToken` — test donation
- `GET /overlay?token=X` — overlay page for OBS
- `GET *` — SPA catch-all (serves dashboard/dist/index.html)

---

## Key Implementation Details

### Filter (`judolFilter.js`)
- **normalizeText()** returns 5 variants: `original`, `normalized` (lowercase+leetspeak), `noSpaces`, `noSeparators`, `deduped`
- **JUDOL_KEYWORDS**: ~30 kata (slot, gacor, maxwin, togel, deposit, dll.)
- **JUDOL_PATTERNS**: 10 regex (spaced-out words, gambling domains, WA numbers, links, etc.)
- Custom blocklist checked first (confidence 1.0), then keywords (0.9), then regex (0.85)
- Export: `filterMessage(message, customBlocklist)` dan `normalizeText`

### WebSocket
- Overlay connect → kirim `{type: "overlay", token: "..."}` → server track per user
- Server broadcast `{type: "donation", donation: {...}}` ke semua overlay client user tsb
- Auto-reconnect di overlay (3s delay)

### Dashboard (`App.jsx`)
- Single-file React app, semua inline styles
- Theme object `T` untuk warna
- `api()` helper: auto-attach `x-user-id` dari sessionStorage (`sg_uid`)
- Auth state di sessionStorage (`sg_uid`, `sg_user`)
- Pages: Login/Register → Dashboard (Stats, Donations tab with All/Blocked/Passed, Blocklist, Settings, Test)
- Auto-refresh donations setiap 15 detik

### Auth
- **INSECURE for production**: auth middleware cuma cek `x-user-id` header, no JWT/session
- Password hashed with bcryptjs (10 rounds)
- Tokens generated with `uuid.v4().replace(/-/g, "")`

---

## Environment Variables
```
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/streamguard
SAWERIA_STREAM_KEY=your_stream_key_here  # for signature verification (currently disabled)
```

---

## Commands
```bash
npm install          # Install backend deps
npm start            # Production: node server.js
npm run dev          # Dev: node --watch server.js
npm run db:init      # Create tables: node db/init.js

cd dashboard
npm install          # Install frontend deps
npm run dev          # Vite dev server :5173
npm run build        # Build to dashboard/dist/
```

---

## Known Limitations / TODOs
1. **Auth insecure** — x-user-id header only, no JWT/session (noted in code)
2. **ML filter layer** — placeholder, not implemented
3. **Saweria signature verification** — code exists but disabled (streamKey passed as empty string)
4. **Trakteer** — no signature/HMAC verification
5. **Dashboard** — single file App.jsx (~1200 lines), could be split into components
6. **No tests** — no test files exist
7. **Overlay** — no XSS sanitization on donation message (innerHTML used)
