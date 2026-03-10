import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { embedTexts } from './embeddings.js';

const INDEX_PATH = path.join(process.cwd(), 'data', 'vector', 'index.json');
const KB_DIR = path.join(process.cwd(), 'data', 'kb');
const RAW_DIR = path.join(process.cwd(), 'data', 'raw');
const SITE_TEXT_DIR = path.join(process.cwd(), 'data', 'site', 'text');

let inMemoryIndex = null;

function chunkText(text, chunkSize = 780, overlap = 140) {
  const chunks = [];
  if (!text?.trim()) return chunks;

  let pointer = 0;
  while (pointer < text.length) {
    const chunk = text.slice(pointer, pointer + chunkSize).trim();
    if (chunk) chunks.push(chunk);
    pointer += chunkSize - overlap;
  }

  return chunks;
}

async function listFilesSafe(dirPath, allowedExtensions) {
  try {
    const entries = await fs.readdir(dirPath);
    return entries
      .filter((entry) => allowedExtensions.some((ext) => entry.endsWith(ext)))
      .sort()
      .map((entry) => path.join(dirPath, entry));
  } catch {
    return [];
  }
}

async function loadKbDocuments() {
  const files = await listFilesSafe(KB_DIR, ['.json']);
  const docs = [];

  for (const filePath of files) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      for (const entry of parsed) {
        if (!entry?.content) continue;
        docs.push({
          title: entry.title || path.basename(filePath),
          category: entry.category || 'General',
          source: entry.source || `kb:${path.basename(filePath)}`,
          content: String(entry.content)
        });
      }
    } catch {
      continue;
    }
  }

  return docs;
}

async function loadRawDocuments() {
  const files = await listFilesSafe(RAW_DIR, ['.md', '.txt']);
  const docs = [];

  for (const filePath of files) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      if (!raw.trim()) continue;

      docs.push({
        title: path.basename(filePath),
        category: 'Scraped',
        source: `raw:${path.basename(filePath)}`,
        content: raw
      });
    } catch {
      continue;
    }
  }

  return docs;
}

async function loadSiteTextDocuments() {
  const files = await listFilesSafe(SITE_TEXT_DIR, ['.txt']);
  const docs = [];

  for (const filePath of files) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      if (!raw.trim()) continue;

      docs.push({
        title: path.basename(filePath),
        category: 'OfficialSiteText',
        source: `site-text:${path.basename(filePath)}`,
        content: raw
      });
    } catch {
      continue;
    }
  }

  return docs;
}

function computeFingerprint(docs) {
  const canonical = docs
    .map((doc) => `${doc.title}|${doc.category}|${doc.source}|${doc.content}`)
    .join('\n');

  return crypto.createHash('sha1').update(canonical).digest('hex');
}

async function collectDocuments() {
  const siteDocs = await loadSiteTextDocuments();
  const includeKb = process.env.RAG_INCLUDE_KB === 'true';
  const includeRaw = process.env.RAG_INCLUDE_RAW === 'true';
  const kbDocs = includeKb || siteDocs.length === 0 ? await loadKbDocuments() : [];
  const rawDocs = includeRaw ? await loadRawDocuments() : [];

  const merged = [...siteDocs, ...kbDocs, ...rawDocs];
  return merged;
}

async function buildIndex(docs, fingerprint) {
  const chunked = [];

  for (const doc of docs) {
    const chunks = chunkText(doc.content);

    for (const chunk of chunks) {
      chunked.push({
        id: `${doc.source}-${chunked.length + 1}`,
        title: doc.title,
        category: doc.category,
        source: doc.source,
        text: chunk
      });
    }
  }

  if (chunked.length === 0) {
    return {
      schemaVersion: 2,
      sourceFingerprint: fingerprint,
      createdAt: new Date().toISOString(),
      size: 0,
      items: []
    };
  }

  const vectors = await embedTexts(chunked.map((entry) => entry.text));

  return {
    schemaVersion: 2,
    sourceFingerprint: fingerprint,
    createdAt: new Date().toISOString(),
    size: chunked.length,
    items: chunked.map((entry, idx) => ({
      ...entry,
      embedding: vectors[idx]
    }))
  };
}

async function persistIndex(index) {
  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

export async function loadVectorIndex() {
  if (inMemoryIndex) return inMemoryIndex;

  const docs = await collectDocuments();
  const fingerprint = computeFingerprint(docs);

  try {
    const raw = await fs.readFile(INDEX_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    if (parsed?.schemaVersion === 2 && parsed?.sourceFingerprint === fingerprint) {
      inMemoryIndex = parsed;
      return inMemoryIndex;
    }
  } catch {
    // Rebuild below
  }

  const rebuilt = await buildIndex(docs, fingerprint);
  inMemoryIndex = rebuilt;
  await persistIndex(rebuilt);
  return inMemoryIndex;
}
