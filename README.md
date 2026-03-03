# StreamGuard v0.2 — Multi-user + Database

## Project Structure
```
streamguard/
├── server.js                # Main server (webhook + WebSocket + API)
├── filters/
│   └── judolFilter.js       # NLP filter module
├── providers/
│   └── saweria.js           # Saweria webhook handler
├── db/
│   ├── init.js              # Database schema setup (run once)
│   ├── pool.js              # PostgreSQL connection pool
│   ├── userModel.js         # User CRUD + auth
│   ├── donationModel.js     # Donation storage + queries
│   └── blocklistModel.js    # Per-user custom blocklist
├── public/
│   └── overlay.html         # Overlay page for OBS
├── package.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL (local or cloud)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env — set your DATABASE_URL

# 3. Create database tables
node db/init.js

# 4. Start server
node server.js
```

## Usage Flow

### 1. Register a streamer account
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -ContentType "application/json" -Body '{"email": "streamer@example.com", "password": "mypassword", "username": "MyStream"}'
```

Response gives you:
- `webhook_url` → paste this in Saweria Integration → Webhook
- `overlay_url` → add this as OBS Browser Source

### 2. Configure Saweria
- Go to saweria.co/admin/integrations
- Enable Webhook toggle
- Paste: `https://YOUR_DOMAIN/webhook/saweria/YOUR_WEBHOOK_TOKEN`
- Save

### 3. Setup OBS
- Add Browser Source
- URL: `https://YOUR_DOMAIN/overlay?token=YOUR_OVERLAY_TOKEN`

### 4. Test
```powershell
# Test clean donation
Invoke-RestMethod -Uri http://localhost:3000/test/donation/YOUR_WEBHOOK_TOKEN -Method POST -ContentType "application/json" -Body '{"message": "Semangat bang!", "donator": "Fan", "amount": 10000}'

# Test judol donation
Invoke-RestMethod -Uri http://localhost:3000/test/donation/YOUR_WEBHOOK_TOKEN -Method POST -ContentType "application/json" -Body '{"message": "slot gacor maxwin", "donator": "Spammer", "amount": 5000}'
```

## API Endpoints

All authenticated endpoints require `x-user-id` header (use user ID from login response).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/me | Get my info + stats |
| GET | /api/donations | All donations |
| GET | /api/donations/blocked | Blocked donations |
| GET | /api/donations/passed | Passed donations |
| POST | /api/donations/:id/approve | Approve false positive |
| POST | /api/settings/filter | Toggle filter {enabled: bool} |
| GET | /api/blocklist | Get custom blocklist |
| POST | /api/blocklist | Add word {word: string} |
| DELETE | /api/blocklist/:word | Remove word |
