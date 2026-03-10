import fs from 'node:fs/promises';
import path from 'node:path';

const TEXT_DIR = path.join(process.cwd(), 'data', 'site', 'text');
const ANALYSIS_DIR = path.join(process.cwd(), 'data', 'site', 'analysis');
const REPORT_JSON = path.join(ANALYSIS_DIR, 'required-data.json');
const REPORT_MD = path.join(ANALYSIS_DIR, 'required-data.md');

const REQUIRED_PATTERNS = [
  {
    key: 'vice_chancellor',
    label: 'Vice Chancellor',
    regex: /vice\s*chancellor[^\n]{0,120}/gi
  },
  {
    key: 'registrar',
    label: 'Registrar',
    regex: /registrar[^\n]{0,120}/gi
  },
  {
    key: 'ssd_dean_or_ssd',
    label: 'SSD / Student Service Division',
    regex: /(ssd|student\s+service\s+division|student\s+support\s+division)[^\n]{0,160}/gi
  },
  {
    key: 'deans_law_design',
    label: 'Dean / School Leadership (Law, Liberal Arts, Design)',
    regex: /(dean|law|liberal\s+arts|school\s+of\s+design|aparna\s+mhetras|sunny\s+thomas)[^\n]{0,180}/gi
  },
  {
    key: 'placements',
    label: 'Placement / Corporate Relations',
    regex: /(placement|corporate\s+relations|internship|ctc|recruitment)[^\n]{0,180}/gi
  },
  {
    key: 'hostel_fees',
    label: 'Hostel Fees',
    regex: /(hostel|accommodation|residential|fee|fees|₹|inr|rs\.?)[^\n]{0,180}/gi
  },
  {
    key: 'seamedu_or_partners',
    label: 'Seamedu / Partner References',
    regex: /(seamedu|partner|collaboration|industry\s+partner)[^\n]{0,180}/gi
  },
  {
    key: 'contacts',
    label: 'Contact Details (Email/Phone/Address)',
    regex: /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+91[-\s]?[0-9]{8,10}|pune|charholi|knowledge\s+city)[^\n]{0,120}/gi
  }
];

function normalizeLine(line) {
  return line.replace(/\s+/g, ' ').trim();
}

function pickBest(items, max = 20) {
  const ranked = [...items].sort((a, b) => {
    const scoreA = (a.matchText.match(/[0-9@₹]/g) || []).length + a.matchText.length * 0.001;
    const scoreB = (b.matchText.match(/[0-9@₹]/g) || []).length + b.matchText.length * 0.001;
    return scoreB - scoreA;
  });

  return ranked.slice(0, max);
}

async function readTextFiles() {
  const files = await fs.readdir(TEXT_DIR);
  const txtFiles = files.filter((name) => name.endsWith('.txt')).sort();
  const docs = [];

  for (const file of txtFiles) {
    const full = path.join(TEXT_DIR, file);
    const content = await fs.readFile(full, 'utf-8');
    docs.push({ file, content });
  }

  return docs;
}

async function runAnalysis() {
  await fs.mkdir(ANALYSIS_DIR, { recursive: true });

  const docs = await readTextFiles();
  const findings = {};

  for (const pattern of REQUIRED_PATTERNS) {
    findings[pattern.key] = {
      label: pattern.label,
      matches: []
    };
  }

  for (const doc of docs) {
    for (const pattern of REQUIRED_PATTERNS) {
      const matches = doc.content.match(pattern.regex) || [];
      for (const match of matches) {
        const clean = normalizeLine(match);
        if (!clean || clean.length < 8) continue;

        findings[pattern.key].matches.push({
          file: doc.file,
          matchText: clean
        });
      }
    }
  }

  for (const key of Object.keys(findings)) {
    const unique = [];
    const seen = new Set();
    for (const item of findings[key].matches) {
      const sig = `${item.file}|${item.matchText.toLowerCase()}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      unique.push(item);
    }

    findings[key].matches = pickBest(unique, 30);
    findings[key].count = findings[key].matches.length;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    scannedFiles: docs.length,
    categories: findings
  };

  await fs.writeFile(REPORT_JSON, JSON.stringify(report, null, 2), 'utf-8');

  const mdSections = [];
  mdSections.push('# ADYPU Crawled Data Analysis');
  mdSections.push('');
  mdSections.push(`Generated: ${report.generatedAt}`);
  mdSections.push(`Scanned files: ${report.scannedFiles}`);
  mdSections.push('');

  for (const key of Object.keys(findings)) {
    const section = findings[key];
    mdSections.push(`## ${section.label}`);
    mdSections.push(`Matches: ${section.count}`);
    mdSections.push('');

    if (section.matches.length === 0) {
      mdSections.push('- No direct matches found.');
      mdSections.push('');
      continue;
    }

    for (const item of section.matches.slice(0, 15)) {
      mdSections.push(`- [${item.file}] ${item.matchText}`);
    }

    mdSections.push('');
  }

  await fs.writeFile(REPORT_MD, mdSections.join('\n'), 'utf-8');

  console.log(`Saved: ${REPORT_JSON}`);
  console.log(`Saved: ${REPORT_MD}`);
}

runAnalysis().catch((error) => {
  console.error(error);
  process.exit(1);
});
