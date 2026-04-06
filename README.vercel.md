# Deploy on Vercel (Next.js)

GitHub Pages cannot run this app (it needs Next.js SSR + `/api/chat`). Vercel can.

## Prerequisites

- A GitHub repo with this project pushed
- A Vercel account

## Recommended Vercel settings (important for RAG)

This app uses a local vector index file (`data/vector/index.json`). In production, the API reads that file (so the chatbot can retrieve context).

### Build Command (recommended)

Set Vercel **Build Command** to:

```bash
npm run ingest && npm run build
```

This generates `data/vector/index.json` during the build, then builds Next.js.

### Environment Variables (Production)

Set these in Vercel → Project → Settings → Environment Variables:

- `SESSION_ENCRYPTION_KEY` (recommended; used for consented session logs)
- `OPENAI_API_KEY` (optional, improves translations + answer generation)
- `GEMINI_API_KEY` (optional alternative to OpenAI)
- `RAG_INCLUDE_KB=true`
- `RAG_INCLUDE_RAW=true`

**If you set `OPENAI_API_KEY`** but want to keep the vector index small (recommended for Vercel), also set:

- `OPENAI_EMBEDDINGS_ENABLED=false`

That keeps embeddings “local” (384-dim) for the index and queries, while still allowing OpenAI for chat/translation.

## Deploy from the Vercel Dashboard

1) Vercel → **Add New… → Project**
2) **Import** your GitHub repo
3) Framework Preset: **Next.js** (auto-detected)
4) Set **Build Command** to `npm run ingest && npm run build`
5) Add env vars (see above)
6) Click **Deploy**

After deploy, open:

- Landing: `/`
- Chat: `/chat`

## Deploy from the Vercel CLI (optional)

```bash
npm i -g vercel
vercel login
vercel
```

Then set env vars:

```bash
vercel env add SESSION_ENCRYPTION_KEY production
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_EMBEDDINGS_ENABLED production
vercel env add RAG_INCLUDE_KB production
vercel env add RAG_INCLUDE_RAW production
```

And redeploy:

```bash
vercel --prod
```

## Notes / Troubleshooting

- **If answers always fall back**: the vector index probably didn’t exist at runtime. Confirm the Vercel build command ran `npm run ingest`, and that the deploy logs show it completed.
- **Serverless filesystem**: consented session logs are written to `/tmp` on Vercel (ephemeral). They can reset on cold starts.
- **Repo size**: this repo contains crawl artifacts under `data/site/`. A `.vercelignore` is included to avoid uploading large HTML/PDF crawl files to Vercel.
