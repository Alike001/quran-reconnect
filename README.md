# QuranReconnect

> Stay connected to the Quran — every day after Ramadan.

QuranReconnect is a distraction-free web application designed to help Muslims sustain their connection with the Quran *after* Ramadan, by turning the seasonal habit into a consistent daily practice.

Built for the **Quran Foundation Ramadan 2026 Hackathon**.

## The Problem

Millions of Muslims reconnect deeply with the Quran during Ramadan but struggle to maintain that consistency afterwards. Most existing apps either feel overwhelming (full mushaf experiences with too many controls) or shallow (a single random verse a day). Neither builds the kind of sustainable habit that keeps the connection alive.

## The Solution

QuranReconnect focuses on three habit-building pillars:

1. **A Verse of the Day on the home page** — one curated, meaningful ayah every day, fetched live from the Quran Foundation Content API. Tap once to listen, tap again to open it in the full Reader.
2. **A full-surah Reader with synced continuous audio** — read the entire surah scrolling vertically, with audio recitation that auto-advances verse by verse. The current verse highlights and auto-scrolls into view as the reciter reads — so you can follow along the way you would in a halaqah.
3. **A simple progress dashboard** — daily streak, bookmarked verses, written reflections, and "continue from where you stopped." Synced to your Quran Foundation account when signed in.

## Key Features

- **Full-surah Reader** — Arabic (Uthmani), English translation, and audio for every verse, loaded in a single API call.
- **Synced continuous recitation** — verse-level audio with auto-advance, current-verse highlighting, and auto-scroll. Toggle Auto off to study one verse at a time.
- **Verse of the Day** — date-deterministic curated daily ayah on the home page (Ayat al-Kursi, Al-Asr, Surah Ash-Sharh, etc.).
- **Streak tracker** — daily reading streak with longest-streak and total-days-read counts.
- **Bookmarks** — save ayahs while reading, synced to your Quran Foundation account.
- **Reflections** — write a personal note on any ayah; build your own Quran journal.
- **Quran Foundation Sign-In** — OAuth 2.1 / PKCE flow, secure server-side token exchange, refresh-token handling.
- **Distraction-free design** — calm typography (Amiri for Arabic, Cormorant Garamond for headings, DM Sans for body), gentle palette inspired by mushaf manuscripts.

## What's Different

Compared to existing Quran apps, the Reader prioritises *reading flow*: instead of clicking "Next" after every verse (which feels like a flashcard app), you scroll naturally through the entire surah while audio guides you verse by verse. Combined with a Verse of the Day that delivers something meaningful before you even decide what to read, the app removes friction from the moment of *deciding* to engage — which is where most post-Ramadan habits die.

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind + React Router
- **Backend:** Node.js (zero-dependency `http` server) for OAuth, token caching, and API proxying
- **Auth:** Quran Foundation OAuth 2.1 with PKCE
- **APIs:** Quran Foundation Content API + User API
- **Hosting:** Vercel (frontend) + Render (backend)

## API Usage

### Content API

- `GET /chapters` — surah list (cached server-side for 24h).
- `GET /verses/by_chapter/{id}` with `translations`, `audio`, and `per_page=300` — fetches the **entire surah** in one call: Arabic, translation, and per-verse audio URLs. This powers the full-surah Reader and synced audio playback.
- `GET /verses/by_key/{surah}:{ayah}` — fetches a single verse for the Verse-of-the-Day card.

### User API

- `OAuth 2.1 /oauth2/auth` + `/oauth2/token` — PKCE-based sign-in. Access tokens never reach the browser; only an HTTP-only session cookie does.
- `GET /auth/v1/bookmarks` and `POST /auth/v1/collections/__default__/bookmarks` — sync bookmarks to the user's Quran Foundation account.
- `DELETE /auth/v1/bookmarks/{id}` — remove a synced bookmark.
- `POST /auth/v1/reading-sessions` — record reading activity for streak tracking.

All API calls happen server-side. The browser only ever talks to our own `/api/*` endpoints, which proxy to QF with the correct tokens — keeping client secrets and access tokens off the client entirely.

## Architecture

```
┌─────────────┐    /api/*    ┌────────────────┐   OAuth + REST   ┌──────────────────────┐
│   Browser   │ ───────────► │  Node backend  │ ───────────────► │   Quran Foundation   │
│ (React/Vite)│ ◄─────────── │ server/index.js│ ◄─────────────── │ Content + User APIs  │
└─────────────┘              └────────────────┘                  └──────────────────────┘
                                     ▲
                                     │ HTTP-only session cookie
```

## Local Setup

### 1. Clone

```bash
git clone https://github.com/Alike001/quran-reconnect.git
cd quran-reconnect
```

### 2. Install

```bash
npm install
```

### 3. Configure `.env`

```
VITE_APP_API_BASE=/api
VITE_USE_MOCK_FALLBACK=false

PORT=3002
FRONTEND_BASE_URL=http://localhost:5173

QF_ENV=prelive
QF_CLIENT_ID=YOUR_CLIENT_ID
QF_CLIENT_SECRET=YOUR_CLIENT_SECRET
QF_REDIRECT_URI=http://localhost:3002/api/auth/callback

QF_TRANSLATION_ID=20
QF_RECITATION_ID=2
QF_MUSHAF_ID=1

SESSION_SECRET=your_random_secret
```

> For local sign-in to work, register `http://localhost:3002/api/auth/callback` as an allowed redirect URI in your Quran Foundation OAuth client.

### 4. Run

In two terminals:

```bash
npm run server   # backend on :3002
npm run dev      # frontend on :5173
```

Open http://localhost:5173.

## Goal

Transform Quran engagement from a seasonal Ramadan habit into a consistent daily practice — one ayah at a time.
