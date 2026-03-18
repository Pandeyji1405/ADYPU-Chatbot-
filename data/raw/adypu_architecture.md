# ADYPU Multilingual RAG Chatbot — Architecture & Project Explanation

Source: Internal project documentation

---

## What is this Project?

This is the official ADYPU AI Chatbot — a Retrieval-Augmented Generation (RAG) based conversational assistant for Ajeenkya DY Patil University, Pune. It answers student queries about fees, admissions, faculty, hostel, placements, and more in multiple languages including English, Hindi, Marathi, Hinglish, Tamil, Telugu, Bengali, Gujarati, and 15+ other languages.

---

## Technology Stack

- Frontend: Next.js 14 App Router (React)
- Backend API: Next.js Route Handler (app/api/chat/route.js)
- RAG Engine: Custom hybrid retrieval (lib/rag.js)
- Vector Store: Local JSON index (data/vector/index.json) + optional Pinecone cloud
- Embeddings: Local hash-based 384-dim vectors (no API key needed) or OpenAI text-embedding-3-small (1536-dim)
- AI Chat: Google Gemini 1.5 Flash (free) or OpenAI GPT-4o-mini or offline extractive fallback
- Language Detection: Local Unicode script heuristics or OpenAI
- Styling: Glassmorphism UI with red and white ADYPU theme

---

## Project Folder Structure

```
devesh_project/
├── app/
│   ├── page.js              → Main chat UI (frontend)
│   ├── globals.css          → Glassmorphism styles
│   └── api/
│       └── chat/
│           └── route.js     → Main API endpoint (POST /api/chat)
├── lib/
│   ├── rag.js               → Retrieval + answer generation
│   ├── vector-store.js      → Load/build/cache vector index
│   ├── embeddings.js        → Local or OpenAI embeddings
│   ├── language.js          → Language detection + translation
│   ├── language-support.js  → Supported language codes list
│   ├── conversation.js      → Greeting/thanks/identity intent
│   ├── facts.js             → Domain shortform expansion
│   └── constants.js         → System prompt + fallback message
├── scripts/
│   ├── ingest.mjs           → Build vector index + push to Pinecone
│   └── scrape.mjs           → Scrape ADYPU website pages
├── data/
│   ├── kb/                  → Curated knowledge base JSON files
│   │   ├── adypu_seed.json
│   │   ├── adypu_official.json
│   │   └── adypu_scraped.json
│   ├── raw/                 → Markdown and text files for ingestion
│   │   ├── adypu_scraped_data.md
│   │   └── adypu-edu-in-*.md
│   ├── site/
│   │   └── text/            → Scraped website plain text files
│   └── vector/
│       └── index.json       → Built vector index (13353 chunks)
├── public/
│   └── adypu-logo.svg       → University logo
├── .env.local               → API keys and config
└── package.json
```

---

## Complete Runtime Flow (Step by Step)

### Step 1 — User sends a message
User types a question in the chat UI (app/page.js). The frontend sends a POST request to /api/chat with the message, conversation history, and optional API key.

### Step 2 — Language Detection (lib/language.js)
The API detects the language of the message using Unicode script heuristics. Devanagari script = Hindi or Marathi. Tamil script = Tamil. Arabic script = Arabic or Urdu. Latin with Hinglish markers (kya, kaise, hai) = Hinglish. If OpenAI key is set, it uses GPT for more accurate detection.

### Step 3 — Intent Detection (lib/conversation.js)
Short messages (under 8 words) are checked for intent:
- Greeting intent (hi, hello, namaste, bonjour) → returns greeting reply
- Thanks intent (thanks, dhanyavaad, merci) → returns thanks reply
- Identity intent (who are you, what are you) → returns bot identity reply
- All other messages → proceed to RAG retrieval

### Step 4 — Query Embedding (lib/embeddings.js)
The query text is converted to a 384-dimensional vector using a local hash-based embedder. No API key is needed. If OpenAI key is set, it uses text-embedding-3-small for 1536-dim vectors.

### Step 5 — Hybrid Retrieval (lib/rag.js + lib/vector-store.js)
The vector index (13353 chunks from KB JSON files and markdown files) is searched using two methods combined:
- Semantic search: cosine similarity between query vector and chunk vectors (62% weight)
- Lexical search: keyword token overlap between query and chunk text (38% weight)
- Source hint boost: extra score boost for known topic-source matches (e.g. fee query + fees source = +0.20 boost)
Top K results (default 6) are returned and filtered by minimum confidence score.

### Step 6 — Confidence Check
If no chunk scores above the minimum threshold (RAG_MIN_SCORE = 0.29), the bot returns the mandatory fallback message: "Sorry, I can't understand your query. For better understanding, please contact Student Council's President Devesh Pandey (Insta: pandeyji_2901) or visit the SSD office in ULC 5."

### Step 7 — Answer Generation (lib/rag.js generateAnswer)
If confident chunks are found, the answer is generated in this priority order:
1. Google Gemini 1.5 Flash (free tier) — if GEMINI_API_KEY is set
2. OpenAI GPT-4o-mini — if OPENAI_API_KEY is set
3. Offline extractive answer — always available, no key needed (pulls best matching sentence from KB chunks)

### Step 8 — Translation
If the detected language is not English, the answer is translated to the user's language. Hinglish responses use Roman Hindi script. Pre-translated fallback messages exist for 16 languages (Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Punjabi, Malayalam, Kannada, Arabic, Urdu, French, German, Spanish, Portuguese, Russian, Chinese).

### Step 9 — Response returned to UI
The API returns the answer text, detected language code, and source citations (title, source URL, confidence score). The UI displays the answer and can read it aloud using text-to-speech.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                   │
│                         app/page.js                         │
│   [Chat Input] → [Voice Input STT] → [Send Button]          │
│   [Chat Messages] ← [Voice Output TTS] ← [Source Chips]     │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/chat
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (route.js)                     │
│                                                             │
│  1. detectLanguage()     → lib/language.js                  │
│  2. detectConversationIntent() → lib/conversation.js        │
│  3. retrieveContext()    → lib/rag.js                       │
│  4. generateAnswer()     → lib/rag.js                       │
│  5. translateText()      → lib/language.js                  │
└──────────┬───────────────────────────┬──────────────────────┘
           │                           │
           ▼                           ▼
┌──────────────────┐       ┌────────────────────────┐
│   RAG ENGINE     │       │   AI ANSWER ENGINE     │
│   lib/rag.js     │       │   lib/rag.js           │
│                  │       │                        │
│ embedText()      │       │ 1. Gemini 1.5 Flash    │
│ cosineSimilarity │       │    (FREE - preferred)  │
│ lexicalSimilarity│       │ 2. OpenAI GPT-4o-mini  │
│ sourceHintBoost  │       │    (paid - fallback)   │
│ rankDocuments()  │       │ 3. Offline Extractive  │
└──────────┬───────┘       │    (always works)      │
           │               └────────────────────────┘
           ▼
┌───────────────────────────────────────────────────┐
│              VECTOR STORE                         │
│         lib/vector-store.js                       │
│                                                   │
│  data/vector/index.json  (13353 chunks)           │
│  ┌─────────────────────────────────────────────┐  │
│  │ id | title | category | source | text       │  │
│  │    | embedding[384]                         │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  Optional: Pinecone Cloud Index (quickstart)      │
└───────────────────────────────────────────────────┘
           ▲
           │ npm run ingest
           │
┌───────────────────────────────────────────────────┐
│              KNOWLEDGE BASE                       │
│                                                   │
│  data/kb/adypu_seed.json      → Core facts        │
│  data/kb/adypu_official.json  → Officials/links   │
│  data/kb/adypu_scraped.json   → Fees/contacts     │
│  data/raw/adypu_scraped_data.md → Full KB in MD   │
│  data/raw/adypu-edu-in-*.md   → Scraped pages     │
│  data/site/text/*.txt         → Website text      │
└───────────────────────────────────────────────────┘
```

---

## Data Ingestion Pipeline

```
npm run scrape
      ↓
Fetches ADYPU website pages
(adypu.edu.in, /admissions, /placements, /contact-us, /university-officials)
      ↓
Saves to data/site/text/*.txt and data/site/html/*.html

npm run ingest
      ↓
Reads all sources:
  - data/site/text/*.txt       (scraped website)
  - data/kb/*.json             (curated KB)
  - data/raw/*.md / *.txt      (if RAG_INCLUDE_RAW=true)
      ↓
Chunks each document (900 chars, 160 overlap)
      ↓
Embeds each chunk → 384-dim vector (local) or 1536-dim (OpenAI)
      ↓
Saves to data/vector/index.json
      ↓
If PINECONE_API_KEY set → upserts to Pinecone cloud index
```

---

## Language Support

The chatbot supports 20+ languages:

Indian Languages: Hindi, Marathi, Bengali, Gujarati, Punjabi, Tamil, Telugu, Kannada, Malayalam, Odia, Urdu, Nepali, Hinglish (Roman Hindi)

International Languages: English, Arabic, French, German, Spanish, Portuguese, Russian, Chinese, Japanese, Korean, Hebrew, Thai, Vietnamese, Malay, Indonesian, Italian, Turkish

---

## Fallback Behavior

When a query is out of scope or confidence is too low, the bot returns this message (translated to detected language):

"Sorry, I can't understand your query. For better understanding, please contact Student Council's President Devesh Pandey (Insta: pandeyji_2901) or visit the SSD office in ULC 5."

Pre-translated versions exist for: Hindi, Marathi, Bengali, Gujarati, Punjabi, Tamil, Telugu, Kannada, Malayalam, Arabic, Urdu, French, German, Spanish, Portuguese, Russian, Chinese.

---

## Key Configuration (env variables)

- GEMINI_API_KEY: Google Gemini free API key (get from aistudio.google.com/app/apikey)
- OPENAI_API_KEY: OpenAI key (optional, paid)
- PINECONE_API_KEY: Pinecone vector DB key (optional)
- PINECONE_INDEX_NAME: Pinecone index name (e.g. quickstart)
- PINECONE_NAMESPACE: Pinecone namespace (default: adypu)
- RAG_TOP_K: Number of top chunks to retrieve (default: 6)
- RAG_MIN_SCORE: Minimum confidence score threshold (default: 0.29)
- RAG_INCLUDE_RAW: Set true to include data/raw files in ingestion

---

## How to Run

```bash
# Install dependencies
npm install

# Copy env file and add API keys
cp .env.example .env.local

# Build vector index
npm run ingest

# Start development server
npm run dev
```

Open http://localhost:3000

---

## Sample Questions the Bot Can Answer

- What is the fee for B.Tech CSE?
- Who is the Vice Chancellor of ADYPU?
- Who is the Dean of SSD?
- Hostel fees kitne hai? (Hindi)
- Admission process kya hai? (Hinglish)
- School of Design chi fees kiti ahe? (Marathi)
- What scholarships are available?
- What is the contact number for admissions?
- Who is the Dean of School of Management?
- What programs does School of Engineering offer?
