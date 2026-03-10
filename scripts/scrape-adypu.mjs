import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'raw');
const DEFAULT_URLS = [
  'https://adypu.edu.in/',
  'https://adypu.edu.in/university-officials/',
  'https://adypu.edu.in/admissions/',
  'https://adypu.edu.in/placements/',
  'https://adypu.edu.in/contact-us/'
];

function slugFromUrl(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

function htmlToMarkdown(html, sourceUrl) {
  const $ = load(html);
  $('script, style, noscript, header, footer, nav, form, svg').remove();

  const contentRoot = $('main').first().length ? $('main').first() : $('body');
  const title = (contentRoot.find('h1').first().text() || $('title').text() || sourceUrl).trim();
  const textBlocks = [];

  contentRoot.find('h1, h2, h3, h4, p, li, td, th').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && text.length > 20) {
      textBlocks.push(text);
    }
  });

  const uniqueBlocks = Array.from(new Set(textBlocks));
  return `# ${title}\n\nSource: ${sourceUrl}\n\n${uniqueBlocks.join('\n\n')}`;
}

async function scrapeViaHttp(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ADYPU-RAG-Bot/1.0 (+academic project)'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const html = await response.text();
  return htmlToMarkdown(html, url);
}

async function scrapeViaFirecrawl(url, apiKey) {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true
    })
  });

  if (!response.ok) {
    throw new Error(`Firecrawl failed (${response.status}) for ${url}`);
  }

  const payload = await response.json();
  const markdown = payload?.data?.markdown;

  if (!markdown) {
    throw new Error(`No markdown from Firecrawl for ${url}`);
  }

  return `Source: ${url}\n\n${markdown}`;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const urls = (process.env.ADYPU_SCRAPE_URLS || DEFAULT_URLS.join(','))
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  for (const url of urls) {
    try {
      const markdown = firecrawlKey ? await scrapeViaFirecrawl(url, firecrawlKey) : await scrapeViaHttp(url);
      const fileName = `${slugFromUrl(url)}.md`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      await fs.writeFile(filePath, markdown, 'utf-8');
      console.log(`Saved ${filePath}`);
    } catch (error) {
      console.error(`Failed ${url}:`, error.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
