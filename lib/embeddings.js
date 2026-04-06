import crypto from 'node:crypto';
import OpenAI from 'openai';

const LOCAL_VECTOR_SIZE = 384;

function hashToken(token) {
  const hash = crypto.createHash('sha256').update(token).digest();
  return hash.readUInt32BE(0);
}

function normalize(vec) {
  let sum = 0;
  for (const val of vec) sum += val * val;
  const norm = Math.sqrt(sum) || 1;
  return vec.map((v) => v / norm);
}

function localEmbed(text) {
  const cleaned = (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const vec = new Array(LOCAL_VECTOR_SIZE).fill(0);

  if (!cleaned) return vec;

  const tokens = cleaned.split(' ');
  for (const token of tokens) {
    if (!token) continue;
    const h = hashToken(token);
    const idx = h % LOCAL_VECTOR_SIZE;
    const sign = (h >> 1) % 2 === 0 ? 1 : -1;
    vec[idx] += sign;
  }

  return normalize(vec);
}

export async function embedTexts(texts) {
  const apiKey = process.env.OPENAI_API_KEY;
  const embeddingsEnabled = process.env.OPENAI_EMBEDDINGS_ENABLED !== 'false';
  if (!apiKey || !embeddingsEnabled) return texts.map((t) => localEmbed(t));

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.embeddings.create({
      model: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
      input: texts
    });

    return response.data.map((d) => d.embedding);
  } catch {
    return texts.map((t) => localEmbed(t));
  }
}

export async function embedText(text) {
  const [vector] = await embedTexts([text]);
  return vector;
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const va = a[i];
    const vb = b[i];
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
