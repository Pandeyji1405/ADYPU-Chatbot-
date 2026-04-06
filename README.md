# ADYPU Saathi — Multilingual Campus Chatbot (Master)

Official-style ADYPU assistant demo aligned to the provided “ADYPU Chatbot Master Prompt”:
- Multi-language welcome + explicit language selection (English/Hindi/Marathi/Bengali/Gujarati/Punjabi/Rajasthani)
- Consent gate before any session logging
- INT-01…INT-18 intent taxonomy with scripted flows for key tasks (fees/admissions/emergency/lost & found)
- Verified KB only (no web-search fallback)
- Optional multilingual translation via OpenAI/Gemini (if keys configured)
- Audio shortcut: “Press 1 to hear this in audio” + TTS button

## 1) Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:
- Landing page: `http://localhost:3000`
- Chat UI: `http://localhost:3000/chat`

## Deploy (VPS / Docker)

This project reads knowledge from `data/` (KB + vector index) and (optionally) writes consented session logs to disk.

### Option A) Docker (recommended for easiest deploy)

```bash
cp .env.example .env.local
# edit .env.local (set OPENAI_API_KEY + SESSION_ENCRYPTION_KEY at minimum)
docker compose up -d --build
```

Open: `http://<server-ip>:3000`

### Option B) Node.js on a VPS

```bash
cp .env.example .env.local
# edit .env.local (set OPENAI_API_KEY + SESSION_ENCRYPTION_KEY at minimum)
npm ci
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

### Serverless note (Vercel/Netlify)

- Filesystem is ephemeral; session logs may reset between cold starts.
- By default, the app will not auto-rebuild the vector index in production (`RAG_AUTO_REBUILD=false` by default). Run `npm run ingest` during development to refresh `data/vector/index.json` before deploying.

## Deploy (Vercel)

See `README.vercel.md`.

## Deploy (Firebase Console — App Hosting)

If you want to deploy from the **Firebase Console**, use **Firebase App Hosting** (Next.js SSR supported).

High-level steps:
1) Push this repo to GitHub.
2) In Firebase Console → **App Hosting** → **Get started**, connect your GitHub repo and pick the branch to deploy.
3) Configure runtime env/secrets (recommended: `OPENAI_API_KEY`, `SESSION_ENCRYPTION_KEY`).

This repo includes an `apphosting.yaml` that:
- Allocates more memory (vector index can be RAM-heavy)
- Keeps `data/` in the deployed bundle
- Writes runtime files to `/tmp`
- Enables automatic vector index rebuild (`RAG_AUTO_REBUILD=true`)

Set secrets (CLI; stored in Cloud Secret Manager):
```bash
firebase apphosting:secrets:set OPENAI_API_KEY --project <firebase-project-id>
firebase apphosting:secrets:set SESSION_ENCRYPTION_KEY --project <firebase-project-id>
```

Recommended env vars in `.env.local`:
- `OPENAI_API_KEY` (better multilingual translation + optional chat)
- `SESSION_ENCRYPTION_KEY` (AES-256-GCM at-rest session logs)

## Deploy (GitHub)

### Can we deploy “on GitHub” directly?

- **GitHub Pages cannot run this app** (it’s static hosting only). This project needs a server for Next.js SSR + `/api/chat`.
- Use GitHub to **store the code** and then deploy it to a real host (Firebase App Hosting / Vercel / VPS / Docker).

### Push the project to GitHub

1) Create a new repo in GitHub (no README; keep it empty).
2) In this project folder:

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### Auto-build on every push (GitHub Actions)

This repo includes a CI workflow that runs `npm ci` + `npm run build` on every push / PR.

### Deploy from GitHub (recommended)

- **Firebase App Hosting (Console)**: Connect the repo in Firebase Console → App Hosting and it deploys on every push.
- **Vercel**: Import the GitHub repo in Vercel, set env vars, and it deploys on every push.

## 2) Required Fallback Behavior

When a query is out of scope / not in the verified KB, backend returns this English fallback (or translated equivalent in the selected language):

`I don’t have that information right now. Please contact info@adypu.edu.in or call +91-8956487911 for assistance.`

## 3) Data Included by Default

Knowledge files are in `data/kb/` (JSON):
- `data/kb/adypu_scraped.json` (fees, contacts, scholarships, programs, events, highlights)
- `data/kb/adypu_seed.json` / `data/kb/adypu_official.json` (quick facts)
- `data/kb/adypu_master_prompt.json` (Student Council, NSS, PhD, Governing Board, club-join steps)

## 4) Scraping and Ingestion Pipeline

### A) Scrape ADYPU website

```bash
npm run scrape
```

By default it pulls official ADYPU pages:
- `/`
- `/university-officials/`
- `/admissions/`
- `/placements/`
- `/contact-us/`

To improve extraction quality, set `FIRECRAWL_API_KEY` in `.env.local`.
For public pages with heavy dynamic layout, Firecrawl extraction is strongly recommended.

### B) Ingest web + seed data into vectors

```bash
npm run ingest
```

This writes a local vector index to `data/vector/index.json`.

By default ingestion reads `data/kb/*.json` (and optionally official site text).  
Set `RAG_INCLUDE_RAW=true` if you also want raw scraped markdown indexed.

### C) Optional Pinecone upsert

Set:
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- optional `PINECONE_NAMESPACE`

Then run `npm run ingest` again to push vectors.

## 5) Instagram Data (Best Practice)

Use **Meta Graph API** (not brittle scraping):

```bash
node scripts/fetch-instagram.mjs
```

Set:
- `META_GRAPH_TOKEN`
- `IG_BUSINESS_ACCOUNT_ID`

This writes `data/raw/instagram-feed.md`, which is ingested by `npm run ingest`.

## 6) Architecture

- Frontend: Next.js App Router (`app/page.js` landing, `app/chat/page.js` chat)
- API: `app/api/chat/route.js` (language + consent gate, intent routing, KB-only answers)
- RAG: `lib/rag.js`, `lib/vector-store.js`, `lib/embeddings.js`
- Language handling: `lib/language.js`, `lib/language-support.js`
- Intent + scripts: `lib/intent.js`, `lib/saathi-engine.js`
- Session logging (encrypted at rest, consent-gated): `lib/session-store.js`, `lib/crypto.js`

### Runtime flow
1. User message enters `/api/chat`.
2. Language selection (if not set) → consent prompt.
3. Intent classification (INT-01…INT-18) + scripted flows for key tasks.
4. Otherwise: hybrid retrieval over local ADYPU KB and grounded answer generation.
5. If insufficient KB match: strict out-of-scope fallback (translated).
6. UI renders the answer + optional TTS (“Press 1…” shortcut).

## 7) Accuracy Strategy (Recommended)

For high-accuracy examiner demo:
1. Scrape official ADYPU pages daily (officials, fees, admissions, contact pages).
2. Keep Instagram and website chunks in separate metadata tags (`source_type`).
3. Use reranking + strict threshold (`RAG_MIN_SCORE`) to avoid hallucination.
4. Show cited source chips in UI (already enabled).
5. Re-ingest after content updates.

## 8) Production Notes

- Replace `public/adypu-logo.svg` with official ADYPU logo asset.
- Add HTTPS + API rate-limiting for deployment.
- Add moderation filter for abusive inputs if needed.
