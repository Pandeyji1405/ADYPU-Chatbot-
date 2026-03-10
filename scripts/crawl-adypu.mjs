import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const START_URL = process.env.CRAWL_START_URL || 'https://adypu.edu.in/';
const ALLOWED_HOSTS = new Set(['adypu.edu.in', 'www.adypu.edu.in']);
const MAX_PAGES = Number(process.env.CRAWL_MAX_PAGES || 1500);
const CONCURRENCY = Number(process.env.CRAWL_CONCURRENCY || 6);
const REQUEST_TIMEOUT_MS = Number(process.env.CRAWL_TIMEOUT_MS || 20000);
const OUTPUT_HTML_DIR = path.join(process.cwd(), 'data', 'site', 'html');
const OUTPUT_TEXT_DIR = path.join(process.cwd(), 'data', 'site', 'text');
const OUTPUT_ANALYSIS_DIR = path.join(process.cwd(), 'data', 'site', 'analysis');
const MANIFEST_PATH = path.join(OUTPUT_ANALYSIS_DIR, 'crawl-manifest.json');

function normalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.hash = '';

    const host = u.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.has(host)) return null;

    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

    if (u.hostname === 'www.adypu.edu.in') {
      u.hostname = 'adypu.edu.in';
    }

    if (u.pathname.endsWith('/index.html')) {
      u.pathname = u.pathname.replace(/\/index\.html$/, '/');
    }

    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }

    return u.toString();
  } catch {
    return null;
  }
}

function slugFromUrl(url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);
  const cleaned = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();

  return `${cleaned}-${hash}`;
}

function htmlToPlainText(html, sourceUrl) {
  const $ = load(html);
  $('script, style, noscript, svg').remove();

  const title = ($('title').text() || sourceUrl).trim();
  const lines = [];

  $('h1, h2, h3, h4, h5, h6, p, li, td, th, address').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && text.length > 10) {
      lines.push(text);
    }
  });

  const deduped = Array.from(new Set(lines));
  return `Title: ${title}\nSource: ${sourceUrl}\n\n${deduped.join('\n\n')}`;
}

function extractLinks(html, baseUrl) {
  const $ = load(html);
  const links = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const absolute = normalizeUrl(new URL(href, baseUrl).toString());
    if (!absolute) return;

    if (/\.(pdf|jpg|jpeg|png|gif|webp|zip|rar|mp4|mp3|docx?|xlsx?|pptx?)$/i.test(absolute)) {
      return;
    }

    links.push(absolute);
  });

  return Array.from(new Set(links));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ADYPU-Crawler/1.0 (+academic project crawler)'
      }
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function runCrawler() {
  await fs.mkdir(OUTPUT_HTML_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_TEXT_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_ANALYSIS_DIR, { recursive: true });

  const start = normalizeUrl(START_URL);
  if (!start) {
    throw new Error(`Invalid start URL: ${START_URL}`);
  }

  const queue = [start];
  const discovered = new Set([start]);
  const visited = new Set();
  const manifest = [];

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const batch = [];
    while (queue.length > 0 && batch.length < CONCURRENCY && visited.size + batch.length < MAX_PAGES) {
      const next = queue.shift();
      if (!next || visited.has(next)) continue;
      visited.add(next);
      batch.push(next);
    }

    if (batch.length === 0) break;

    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          const response = await fetchWithTimeout(url);
          const status = response.status;
          const contentType = response.headers.get('content-type') || '';

          if (!response.ok) {
            return { url, status, ok: false, error: `HTTP ${status}` };
          }

          if (!contentType.includes('text/html')) {
            return { url, status, ok: false, error: `Skipped content-type ${contentType}` };
          }

          const html = await response.text();
          const text = htmlToPlainText(html, url);
          const links = extractLinks(html, url);

          const slug = slugFromUrl(url);
          const htmlPath = path.join(OUTPUT_HTML_DIR, `${slug}.html`);
          const textPath = path.join(OUTPUT_TEXT_DIR, `${slug}.txt`);

          await fs.writeFile(htmlPath, html, 'utf-8');
          await fs.writeFile(textPath, text, 'utf-8');

          for (const link of links) {
            if (!discovered.has(link)) {
              discovered.add(link);
              queue.push(link);
            }
          }

          return {
            url,
            status,
            ok: true,
            htmlFile: path.relative(process.cwd(), htmlPath),
            textFile: path.relative(process.cwd(), textPath),
            outboundLinks: links.length
          };
        } catch (error) {
          return { url, status: 0, ok: false, error: error.message };
        }
      })
    );

    manifest.push(...results);
    const successCount = results.filter((entry) => entry.ok).length;
    const failCount = results.length - successCount;

    console.log(`Processed ${visited.size}/${MAX_PAGES} pages | batch=${results.length} | success=${successCount} | failed=${failCount}`);
  }

  const summary = {
    startUrl: start,
    generatedAt: new Date().toISOString(),
    maxPages: MAX_PAGES,
    visitedCount: visited.size,
    successCount: manifest.filter((entry) => entry.ok).length,
    failedCount: manifest.filter((entry) => !entry.ok).length,
    discoveredCount: discovered.size,
    items: manifest
  };

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`Saved manifest: ${MANIFEST_PATH}`);
}

runCrawler().catch((error) => {
  console.error(error);
  process.exit(1);
});
