# ADYPU Multilingual Futuristic RAG Chatbot

Examiner-ready full-stack chatbot for Ajeenkya DY Patil University with:
- [x] Professional Dark Slate & Cyan/Indigo UI (advanced enterprise demo ready)
- [x] 3D Human-designed layout with immersive Command Center styling
- [x] Framer Motion micro-interactions & animated initial greeting state
- [x] Voice input (speech-to-text) and voice output (text-to-speech)
- [x] Auto language detection and same-language responses
- [x] Greeting/thanks intent handling (multilingual)
- [x] Hybrid Retrieval-Augmented Generation (semantic + lexical RAG)
- [x] Mandatory translated fallback for out-of-scope queries

## 1) Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Important: set `OPENAI_API_KEY` in `.env.local` for best multilingual translation quality across Indian + global languages.

## 2) Required Fallback Behavior

When query is out of scope / low-confidence, backend returns this exact English fallback (or translated equivalent in detected language):

`Sorry, I can't understand your query. For better understanding, please contact Student Council's President Devesh Pandey (Insta: pandeyji_2901) or visit the SSD office in ULC 5.`

## 3) Data Included by Default

Knowledge files are in `data/kb/adypu_seed.json` and `data/kb/adypu_official.json`, including:
- Vice Chancellor: Dr. Rakesh Kumar Jain
- Registrar: Dr. Sudhakar Shinde
- SSD Dean: Dr. Vijay Kulkarni (ULC 5)
- Dean references: Dr. Sunny Thomas, Ar. Aparna Mhetras
- Hostel fees: approx. INR 90,000 to INR 1,80,000 (excluding mess)
- Placement reference: Bhagyashri Vyas (Corporate Relations)
- Partner reference: Seamedu
- Official source-linked records for university officials, admissions, placements, and contact routing

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

By default ingestion uses curated KB JSON files only.  
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

- Frontend: Next.js App Router (`app/page.js`, `app/globals.css`)
- API: `app/api/chat/route.js`
- RAG: `lib/rag.js`, `lib/vector-store.js`, `lib/embeddings.js`
- Language handling: `lib/language.js`, `lib/language-support.js`
- Conversation intent: `lib/conversation.js`

### Runtime flow
1. User message enters `/api/chat`.
2. Language auto-detected.
3. Greeting/thanks short-text detection.
4. Hybrid retrieval (semantic + lexical) over indexed ADYPU knowledge.
5. If low confidence: translated mandatory fallback message.
6. If high confidence: grounded multilingual answer.
6. UI renders answer and can read it aloud.

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
