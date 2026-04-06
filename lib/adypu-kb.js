import fs from 'node:fs/promises';
import path from 'node:path';

const KB_DIR = path.join(process.cwd(), 'data', 'kb');

let CACHE = null;
let CACHE_AT = 0;
const CACHE_TTL_MS = 60_000;

async function readJsonFile(fullPath) {
  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export async function loadAdypuKb() {
  const now = Date.now();
  if (CACHE && now - CACHE_AT < CACHE_TTL_MS) return CACHE;

  let files = [];
  try {
    files = (await fs.readdir(KB_DIR)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    files = [];
  }

  const items = [];
  for (const file of files) {
    try {
      const fullPath = path.join(KB_DIR, file);
      const rows = await readJsonFile(fullPath);
      for (const row of rows) {
        if (!row || typeof row !== 'object') continue;
        if (!row.content) continue;
        items.push({
          title: row.title || file,
          category: row.category || 'General',
          source: row.source || `kb:${file}`,
          content: String(row.content)
        });
      }
    } catch {
      // ignore bad file
    }
  }

  CACHE = items;
  CACHE_AT = now;
  return items;
}

export async function findKbByTitle(title) {
  const target = String(title || '').toLowerCase().trim();
  if (!target) return null;
  const items = await loadAdypuKb();
  return items.find((item) => String(item.title || '').toLowerCase().trim() === target) || null;
}

export async function findKbByCategory(category) {
  const target = String(category || '').toLowerCase().trim();
  if (!target) return [];
  const items = await loadAdypuKb();
  return items.filter((item) => String(item.category || '').toLowerCase().trim() === target);
}

