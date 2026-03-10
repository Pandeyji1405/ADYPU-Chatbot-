import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Pinecone } from '@pinecone-database/pinecone';
import { embedTexts } from '../lib/embeddings.js';

const RAW_DIR = path.join(process.cwd(), 'data', 'raw');
const KB_DIR = path.join(process.cwd(), 'data', 'kb');
const SITE_TEXT_DIR = path.join(process.cwd(), 'data', 'site', 'text');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'vector', 'index.json');

function chunkText(text, chunkSize = 900, overlap = 160) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const chunks = [];
  let pointer = 0;

  while (pointer < normalized.length) {
    const chunk = normalized.slice(pointer, pointer + chunkSize).trim();
    if (chunk) chunks.push(chunk);
    pointer += chunkSize - overlap;
  }

  return chunks;
}

function makeId(input) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 16);
}

async function collectDocuments() {
  const docs = [];
  const includeRaw = process.env.RAG_INCLUDE_RAW === 'true';
  const includeKb = process.env.RAG_INCLUDE_KB === 'true';

  let siteFiles = [];
  try {
    siteFiles = (await fs.readdir(SITE_TEXT_DIR)).filter((file) => file.endsWith('.txt')).sort();
  } catch {
    siteFiles = [];
  }

  for (const file of siteFiles) {
    const fullPath = path.join(SITE_TEXT_DIR, file);
    const content = await fs.readFile(fullPath, 'utf-8');
    if (!content.trim()) continue;

    docs.push({
      title: file,
      category: 'OfficialSiteText',
      source: `site-text:${file}`,
      content
    });
  }

  const shouldReadKb = includeKb || docs.length === 0;
  const kbFiles = shouldReadKb
    ? (await fs.readdir(KB_DIR))
        .filter((file) => file.endsWith('.json'))
        .sort()
    : [];

  for (const kbFile of kbFiles) {
    const kbPath = path.join(KB_DIR, kbFile);
    const kbRaw = await fs.readFile(kbPath, 'utf-8');
    const kbItems = JSON.parse(kbRaw);

    if (!Array.isArray(kbItems)) continue;

    for (const item of kbItems) {
      if (!item?.content) continue;
      docs.push({
        title: item.title || kbFile,
        category: item.category || 'General',
        source: item.source || `kb:${kbFile}`,
        content: item.content
      });
    }
  }

  if (includeRaw) {
    let rawFiles = [];
    try {
      rawFiles = (await fs.readdir(RAW_DIR)).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
    } catch {
      rawFiles = [];
    }

    for (const file of rawFiles) {
      const fullPath = path.join(RAW_DIR, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      docs.push({
        title: file,
        category: 'Scraped',
        source: `raw:${file}`,
        content
      });
    }
  }

  return docs;
}

async function buildIndex() {
  const docs = await collectDocuments();
  const chunked = [];

  for (const doc of docs) {
    const chunks = chunkText(doc.content);

    for (const [index, text] of chunks.entries()) {
      const id = makeId(`${doc.source}-${index}-${text.slice(0, 120)}`);
      chunked.push({
        id,
        title: doc.title,
        category: doc.category,
        source: doc.source,
        text
      });
    }
  }

  if (chunked.length === 0) {
    throw new Error('No documents found to ingest.');
  }

  const vectors = await embedTexts(chunked.map((item) => item.text));

  const index = {
    createdAt: new Date().toISOString(),
    size: chunked.length,
    items: chunked.map((item, i) => ({
      ...item,
      embedding: vectors[i]
    }))
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Saved local vector index: ${OUTPUT_FILE} (${index.size} chunks)`);

  return index;
}

async function upsertToPinecone(index) {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;

  if (!apiKey || !indexName) {
    console.log('Skipping Pinecone upsert. Set PINECONE_API_KEY and PINECONE_INDEX_NAME to enable.');
    return;
  }

  const namespace = process.env.PINECONE_NAMESPACE || 'adypu';
  const client = new Pinecone({ apiKey });
  const pineconeIndex = client.index(indexName).namespace(namespace);

  const batchSize = 80;
  for (let i = 0; i < index.items.length; i += batchSize) {
    const batch = index.items.slice(i, i + batchSize);
    await pineconeIndex.upsert(
      batch.map((item) => ({
        id: item.id,
        values: item.embedding,
        metadata: {
          title: item.title,
          category: item.category,
          source: item.source,
          text: item.text
        }
      }))
    );
    console.log(`Upserted ${Math.min(i + batchSize, index.items.length)} / ${index.items.length}`);
  }
}

async function main() {
  const index = await buildIndex();
  await upsertToPinecone(index);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
