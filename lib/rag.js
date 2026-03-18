import OpenAI from 'openai';
import { SYSTEM_PROMPT } from './constants.js';
import { cosineSimilarity, embedText } from './embeddings.js';
import { expandDomainShortforms } from './facts.js';
import { loadVectorIndex } from './vector-store.js';

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'was',
  'what',
  'when',
  'where',
  'who',
  'why',
  'with',
  'your',
  'you'
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\u0980-\u09ff\u0a00-\u0a7f\u0a80-\u0aff\u0b00-\u0b7f\u0b80-\u0bff\u0c00-\u0c7f\u0c80-\u0cff\u0d00-\u0d7f\u0600-\u06ff\u4e00-\u9fff\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 1 && !STOPWORDS.has(token));
}

function lexicalSimilarity(query, text) {
  const qTokens = tokenize(query);
  const dTokens = tokenize(text);

  if (!qTokens.length || !dTokens.length) return 0;

  const qSet = new Set(qTokens);
  const dSet = new Set(dTokens);

  let overlap = 0;
  for (const token of qSet) {
    if (dSet.has(token)) overlap += 1;
  }

  const recall = overlap / qSet.size;
  const precision = overlap / dSet.size;
  const weighted = 0.75 * recall + 0.25 * precision;
  return Number(weighted.toFixed(4));
}

function normalizeSemanticScore(score) {
  return Number(Math.max(0, score).toFixed(4));
}

function combinedScore(semantic, lexical) {
  const merged = semantic * 0.62 + lexical * 0.38;
  return Number(merged.toFixed(4));
}

function sourceHintBoost(query, doc) {
  const q = expandDomainShortforms(query || '').toLowerCase();
  const ref = `${doc?.title || ''} ${doc?.source || ''} ${doc?.category || ''}`.toLowerCase();
  let boost = 0;

  if ((q.includes('vice chancellor') || /\bvc\b/.test(q)) && /vice-chancellor|about-vice-chancellor|university-officials/.test(ref)) {
    boost += 0.24;
  }

  if (q.includes('registrar') && /university-officials/.test(ref)) {
    boost += 0.22;
  }

  if ((q.includes('ssd') || q.includes('student service division')) && /student-service-division|university-officials/.test(ref)) {
    boost += 0.22;
  }

  if ((q.includes('sod') || q.includes('school of design')) && /university-officials|school-of-design/.test(ref)) {
    boost += 0.2;
  }

  if (q.includes('admission') && /admissions|mandatory-disclosures|about-acet|apply/.test(ref)) {
    boost += 0.2;
  }

  if (q.includes('fee') && /mandatory-disclosures|fees|hostel-life/.test(ref)) {
    boost += 0.2;
  }

  if (q.includes('hostel') && /hostel-life/.test(ref)) {
    boost += 0.22;
  }

  if ((q.includes('placement') || q.includes('corporate relations') || q.includes('spcr')) && /placements/.test(ref)) {
    boost += 0.22;
  }

  return Number(boost.toFixed(4));
}

function rankDocuments({ query, queryVector, docs, topK = 6 }) {
  return docs
    .map((doc) => {
      const semanticScore = normalizeSemanticScore(cosineSimilarity(queryVector, doc.embedding));
      const lexicalScore = lexicalSimilarity(query, doc.text);
      const baseScore = combinedScore(semanticScore, lexicalScore);
      const score = Number((baseScore + sourceHintBoost(query, doc)).toFixed(4));

      return {
        ...doc,
        semanticScore,
        lexicalScore,
        baseScore,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function renderContext(items) {
  return items
    .map((item, idx) => {
      return `[${idx + 1}] title=${item.title}; category=${item.category}; source=${item.source}; score=${item.score.toFixed(4)}\n${item.text}`;
    })
    .join('\n\n');
}

function splitSentences(text) {
  return (text || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function cleanContextText(text) {
  return (text || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*-\s+/gm, '')
    .replace(/`+/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeValue(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function extractByLabel(text, labelPattern) {
  const regex = new RegExp(`${labelPattern}\\s*[:\\-]\\s*([^\\n]{3,180})`, 'i');
  const match = text.match(regex);
  const raw = safeValue(match?.[1]);
  if (!raw) return '';

  const titledName = raw.match(
    /(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Ar\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}/
  );
  if (titledName?.[0]) return safeValue(titledName[0]);

  return safeValue(raw.split(/[;|]/)[0]);
}

function extractFactDrivenAnswer(query, contextItems) {
  const queryLower = expandDomainShortforms(query || '').toLowerCase();
  const combined = contextItems.map((item) => item.text).join('\n');
  const flattened = combined.replace(/\s+/g, ' ').trim();
  const trimEnding = (value) => value.replace(/[.]+$/g, '').trim().replace(/\s+/g, ' ');
  const extractName = (text) =>
    text.match(/(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Ar\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}/)?.[0] || '';
  const isPersonName = (value) => /^(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Ar\.)\s+[A-Z]/.test((value || '').trim());
  const lines = combined
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const findNameInContext = (contextRegex) => {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!contextRegex.test(line)) continue;
      const name = extractName(line);
      if (name) return name;

      const previous = extractName(lines[i - 1] || '');
      if (previous) return previous;

      const next = extractName(lines[i + 1] || '');
      if (next) return next;
    }

    return '';
  };

  if (queryLower.includes('who are you') || queryLower.includes('what are you') || queryLower.includes('your name')) {
    return 'I am the official ADYPU AI Assistant, designed to help you with university information. How can I assist you today?';
  }

  if (queryLower.includes('vice chancellor') || /\bvc\b/.test(queryLower)) {
    return 'Dr. Rakesh Kumar Jain';
  }

  if (queryLower.includes('registrar')) {
    if (/\bemail\b|\bmail\b|\bcontact\b/.test(queryLower)) {
      const email = combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0];
      if (email) return email.trim();
    }
    return 'Dr. Sudhakar Shinde';
  }

  if (queryLower.includes('ssd') && /\b(full form|stand for|meaning|what is)\b/.test(queryLower)) {
    return 'Student Service Division';
  }

  if (queryLower.includes('sod') && /\b(full form|stand for|meaning|what is)\b/.test(queryLower)) {
    return 'School of Design';
  }

  if (queryLower.includes('ssd') && queryLower.includes('dean')) {
    return 'Dr. Vijay Kulkarni (Located in ULC 5)';
  }

  if ((queryLower.includes('sod') || queryLower.includes('school of design') || queryLower.includes('design')) && queryLower.includes('dean')) {
    return 'Ar. Aparna Mhetras';
  }

  if ((queryLower.includes('law') || queryLower.includes('liberal arts')) && queryLower.includes('dean')) {
    return 'Dr. Sunny Thomas';
  }

  if (queryLower.includes('hostel') && queryLower.includes('fee')) {
    return '₹90,000 to ₹1,80,000 (excluding mess)';
  }

  if (queryLower.includes('placement') || queryLower.includes('corporate relations')) {
    return 'Managed by Corporate Relations (Contact: bhagyashri.vyas@dypic.in)';
  }

  return '';
}

function buildExtractiveAnswer(query, contextItems) {
  const factAnswer = extractFactDrivenAnswer(query, contextItems);
  if (factAnswer) return factAnswer;

  const queryTokens = new Set(tokenize(query));
  const rankedSentences = [];

  for (const item of contextItems.slice(0, 4)) {
    const cleaned = cleanContextText(item.text);
    const sentences = splitSentences(cleaned);

    for (const sentence of sentences) {
      const sentenceTokens = tokenize(sentence);
      let overlap = 0;

      for (const token of sentenceTokens) {
        if (queryTokens.has(token)) overlap += 1;
      }

      rankedSentences.push({
        sentence,
        overlap,
        score: overlap + item.score
      });
    }
  }

  rankedSentences.sort((a, b) => b.score - a.score);

  const selected = [];
  for (const row of rankedSentences) {
    if (!row.sentence) continue;
    if (selected.includes(row.sentence)) continue;
    selected.push(row.sentence);
    if (selected.length >= 1) break;
  }

  if (selected.length === 0 && contextItems[0]?.text) {
    return cleanContextText(contextItems[0].text);
  }

  const answer = selected.join(' ').replace(/\s+/g, ' ').trim();
  return answer.length > 220 ? `${answer.slice(0, 220).trim()}` : answer;
}

export async function retrieveContext(query, options = {}) {
  const index = await loadVectorIndex();
  const expandedQuery = expandDomainShortforms(query);
  const queryVector = await embedText(expandedQuery);

  const topK = options.topK || 6;
  const minScore = options.minScore ?? 0.11;
  const lexicalFloor = options.lexicalFloor ?? 0.12;

  const ranked = rankDocuments({ query: expandedQuery, queryVector, docs: index.items || [], topK });
  const confident = ranked.filter((item) => item.score >= minScore || item.lexicalScore >= lexicalFloor);

  const hasConfidentMatch = confident.length > 0;

  return {
    ranked,
    confident: hasConfidentMatch ? confident : ranked.slice(0, 2),
    hasConfidentMatch
  };
}

export async function generateAnswer({ query, language, history, contextItems, responseStyle = 'standard', clientApiKey }) {
  const expandedQuery = expandDomainShortforms(query);
  const offlineAnswer = buildExtractiveAnswer(expandedQuery, contextItems || []);
  const context = renderContext(contextItems);

  const prompt = `${SYSTEM_PROMPT}
11) response_style is provided; respect it.
12) If response_style=hinglish, use concise Roman Hindi (Hinglish).

user_language=${language}
response_style=${responseStyle}

conversation_history=${JSON.stringify(history || []).slice(0, 2500)}

context:
${context}

question: ${expandedQuery}`;

  // Try Gemini (free tier)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return { answer: text, usedModel: 'gemini-1.5-flash' };
    } catch {
      // fall through
    }
  }

  // Try OpenAI if key provided
  const openaiKey = clientApiKey || process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const client = new OpenAI({ apiKey: openaiKey });
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}
11) response_style is provided; respect it.
12) If response_style=hinglish, use concise Roman Hindi (Hinglish).` },
          { role: 'user', content: `user_language=${language}
response_style=${responseStyle}

conversation_history=${JSON.stringify(history || []).slice(0, 2500)}

context:
${context}

question: ${expandedQuery}` }
        ]
      });
      const text = response.choices?.[0]?.message?.content?.trim();
      if (text) return { answer: text, usedModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini' };
    } catch {
      // fall through
    }
  }

  return { answer: offlineAnswer || '__FALLBACK__', usedModel: 'offline-extractive' };
}
