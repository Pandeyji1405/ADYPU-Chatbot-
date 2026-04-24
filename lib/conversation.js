import { translateText } from './language.js';

const GREETING_TEXT_ENGLISH =
  'Hello! Welcome to ADYPU Saathi. I can help with admissions, fees, courses, events, hostel, scholarships and more. What would you like to know?';

const THANKS_TEXT_ENGLISH = 'You are welcome. What would you like to know next about ADYPU?';

const GOODBYE_TEXT_ENGLISH = 'Goodbye! Feel free to return anytime. All the best!';

const IDENTITY_TEXT_ENGLISH =
  "I'm ADYPU Saathi - official multilingual chatbot for ADYPU, Pune. Ask me anything about the university!";

const IDENTITY_KEYWORDS = ['who are you', 'what are you', 'your name', 'who is this', 'about you'];

const GREETING_KEYWORDS = [
  'hi',
  'hello',
  'hey',
  'good morning',
  'good afternoon',
  'good evening',
  'namaste',
  'namaskar'
];

const THANKS_KEYWORDS = ['thanks', 'thank you', 'dhanyavaad', 'dhanyavad', 'shukriya', 'aabhar'];

const GOODBYE_KEYWORDS = ['bye', 'goodbye', 'see you', 'thanks bye', 'ok bye'];

const DOMAIN_QUERY_HINTS = [
  'who',
  'what',
  'where',
  'when',
  'how',
  'fee',
  'fees',
  'hostel',
  'placement',
  'admission',
  'registrar',
  'vice chancellor',
  'dean',
  'contact'
];

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[!?.,;:()[\]{}"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function wordCount(text) {
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

export function detectConversationIntent(message) {
  const normalized = normalizeText(message);
  const count = wordCount(normalized);
  const isShort = count <= 8;
  const looksLikeQuestion = DOMAIN_QUERY_HINTS.some((hint) => normalized.includes(hint));

  if (hasKeyword(normalized, IDENTITY_KEYWORDS)) return 'identity';
  if (isShort && hasKeyword(normalized, GOODBYE_KEYWORDS)) return 'goodbye';
  if (isShort && !looksLikeQuestion && hasKeyword(normalized, GREETING_KEYWORDS)) return 'greeting';
  if (isShort && !looksLikeQuestion && hasKeyword(normalized, THANKS_KEYWORDS)) return 'thanks';

  return 'question';
}

export async function buildGreetingReply(language, style = 'standard') {
  if (style === 'hinglish') {
    return 'Hello! Welcome to ADYPU Saathi. Main admissions, fees, courses, events, hostel aur scholarships mein help kar sakta hoon. Aap kya jaanna chahte hain?';
  }
  return translateText(GREETING_TEXT_ENGLISH, language, { style, concise: true });
}

export async function buildThanksReply(language, style = 'standard') {
  if (style === 'hinglish') return 'You are welcome. ADYPU ke baare mein aur kya jaanna chahte hain?';
  return translateText(THANKS_TEXT_ENGLISH, language, { style, concise: true });
}

export async function buildGoodbyeReply(language, style = 'standard') {
  if (style === 'hinglish') return 'Goodbye! Kabhi bhi wapas aaiye. All the best!';
  return translateText(GOODBYE_TEXT_ENGLISH, language, { style, concise: true });
}

export async function buildIdentityReply(language, style = 'standard') {
  if (style === 'hinglish') {
    return 'Main ADYPU Saathi hoon, ADYPU Pune ka official multilingual chatbot. University ke baare mein kuch bhi pooch sakte hain.';
  }
  return translateText(IDENTITY_TEXT_ENGLISH, language, { style, concise: true });
}
