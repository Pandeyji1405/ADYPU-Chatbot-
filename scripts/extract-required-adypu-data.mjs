import fs from 'node:fs/promises';
import path from 'node:path';

const TEXT_DIR = path.join(process.cwd(), 'data', 'site', 'text');
const OUT_JSON = path.join(process.cwd(), 'data', 'site', 'analysis', 'required-data-curated.json');
const OUT_MD = path.join(process.cwd(), 'data', 'site', 'analysis', 'required-data-curated.md');

const FIELD_RULES = [
  {
    key: 'vice_chancellor',
    label: 'Vice Chancellor Candidates',
    regex: /(Vice\s*Chancellor[^\n]{0,140}|\bProf\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b[^\n]{0,100}|\bDr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b[^\n]{0,80})/gi,
    filter: (line) => /vice\s*chancellor|dr\.|prof\./i.test(line)
  },
  {
    key: 'registrar',
    label: 'Registrar Candidates',
    regex: /(Registrar[^\n]{0,160}|registrar@adypu\.edu\.in)/gi,
    filter: (line) => /registrar/i.test(line)
  },
  {
    key: 'deans',
    label: 'Deans / School Leadership',
    regex: /(Dean[^\n]{0,180}|Sunny\s+Thomas[^\n]{0,120}|Aparna\s+Mhetras[^\n]{0,120}|Vijay\s+Kulkarni[^\n]{0,120})/gi,
    filter: (line) => /(dean|sunny\s+thomas|aparna\s+mhetras|vijay\s+kulkarni)/i.test(line)
  },
  {
    key: 'ssd',
    label: 'SSD / Student Service Division',
    regex: /(SSD[^\n]{0,150}|Student\s+Service\s+Division[^\n]{0,150}|ssd@adypu\.edu\.in)/gi,
    filter: (line) => /(ssd|student\s+service\s+division)/i.test(line)
  },
  {
    key: 'placements',
    label: 'Placement / Corporate Relations',
    regex: /(Placement[^\n]{0,180}|Corporate\s+Relations[^\n]{0,180}|CTC[^\n]{0,150}|internship[^\n]{0,150}|recruitment[^\n]{0,150})/gi,
    filter: (line) => /(placement|corporate\s+relations|ctc|internship|recruitment)/i.test(line)
  },
  {
    key: 'fees',
    label: 'Fees / Hostel / Accommodation',
    regex: /((?:₹|INR|Rs\.?)\s*[0-9,]+(?:\s*(?:to|-|–)\s*(?:₹|INR|Rs\.?)?\s*[0-9,]+)?[^\n]{0,90}|hostel[^\n]{0,140}|accommodation[^\n]{0,140}|fees?[^\n]{0,140})/gi,
    filter: (line) => /(₹|inr|rs\.?|hostel|accommodation|fee)/i.test(line)
  },
  {
    key: 'partners',
    label: 'Partners / Seamedu / Collaborations',
    regex: /(Seamedu[^\n]{0,160}|partner[^\n]{0,160}|collaboration[^\n]{0,180}|MoU[^\n]{0,180})/gi,
    filter: (line) => /(seamedu|partner|collaboration|mou)/i.test(line)
  },
  {
    key: 'contacts',
    label: 'Contact Emails / Phones / Address',
    regex: /([A-Z0-9._%+-]+@adypu\.edu\.in|[A-Z0-9._%+-]+@dypic\.in|\+91[-\s]?[0-9]{8,10}|Pune\s*-\s*411081[^\n]{0,80})/gi,
    filter: () => true
  }
];

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function scoreLine(line) {
  const digits = (line.match(/[0-9]/g) || []).length;
  const mails = /@/.test(line) ? 6 : 0;
  const titles = /(Dr\.|Prof\.|Dean|Registrar|Vice\s*Chancellor|Corporate\s*Relations)/i.test(line) ? 5 : 0;
  return digits + mails + titles + Math.min(line.length / 100, 4);
}

function dedupeAndRank(rows, maxItems = 25) {
  const unique = [];
  const seen = new Set();

  for (const row of rows) {
    const normalized = clean(row.text).toLowerCase();
    if (normalized.length < 8) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push({ ...row, text: clean(row.text), score: scoreLine(row.text) });
  }

  unique.sort((a, b) => b.score - a.score);
  return unique.slice(0, maxItems);
}

async function main() {
  const files = (await fs.readdir(TEXT_DIR)).filter((name) => name.endsWith('.txt')).sort();

  const findings = {};
  for (const rule of FIELD_RULES) {
    findings[rule.key] = {
      label: rule.label,
      matches: []
    };
  }

  for (const file of files) {
    const content = await fs.readFile(path.join(TEXT_DIR, file), 'utf-8');

    for (const rule of FIELD_RULES) {
      const matches = content.match(rule.regex) || [];
      for (const raw of matches) {
        const value = clean(raw);
        if (!value) continue;
        if (!rule.filter(value)) continue;

        findings[rule.key].matches.push({
          file,
          text: value
        });
      }
    }
  }

  for (const key of Object.keys(findings)) {
    findings[key].matches = dedupeAndRank(findings[key].matches, 30);
    findings[key].count = findings[key].matches.length;
  }

  const result = {
    generatedAt: new Date().toISOString(),
    scannedFiles: files.length,
    fields: findings
  };

  await fs.writeFile(OUT_JSON, JSON.stringify(result, null, 2), 'utf-8');

  const lines = ['# ADYPU Curated Required Data', '', `Generated: ${result.generatedAt}`, `Scanned files: ${files.length}`, ''];

  for (const key of Object.keys(findings)) {
    const block = findings[key];
    lines.push(`## ${block.label}`);
    lines.push(`Count: ${block.count}`);
    lines.push('');

    if (block.matches.length === 0) {
      lines.push('- No matches found');
      lines.push('');
      continue;
    }

    for (const item of block.matches.slice(0, 15)) {
      lines.push(`- [${item.file}] ${item.text}`);
    }

    lines.push('');
  }

  await fs.writeFile(OUT_MD, lines.join('\n'), 'utf-8');

  console.log(`Saved: ${OUT_JSON}`);
  console.log(`Saved: ${OUT_MD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
