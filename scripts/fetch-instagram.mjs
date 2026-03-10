import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_PATH = path.join(process.cwd(), 'data', 'raw', 'instagram-feed.md');

async function main() {
  const token = process.env.META_GRAPH_TOKEN;
  const accountId = process.env.IG_BUSINESS_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error('Set META_GRAPH_TOKEN and IG_BUSINESS_ACCOUNT_ID to fetch Instagram data via Meta Graph API.');
  }

  const fields = 'id,caption,timestamp,permalink,media_type';
  const limit = Number(process.env.IG_POST_LIMIT || 25);
  const url = `https://graph.facebook.com/v20.0/${accountId}/media?fields=${fields}&limit=${limit}&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Meta Graph API failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rows = payload.data || [];

  const lines = ['# Instagram Updates', 'Source: Meta Graph API'];

  for (const post of rows) {
    const caption = (post.caption || '').replace(/\s+/g, ' ').trim();
    lines.push(`## Post ${post.id}`);
    lines.push(`Timestamp: ${post.timestamp || 'N/A'}`);
    lines.push(`Permalink: ${post.permalink || 'N/A'}`);
    lines.push(`Media Type: ${post.media_type || 'N/A'}`);
    lines.push(`Caption: ${caption || 'No caption'}`);
    lines.push('');
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, lines.join('\n'), 'utf-8');
  console.log(`Saved ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
