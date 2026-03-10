import { translateText } from './language.js';

const GREETING_TEXT_ENGLISH = 'Hello.';

const THANKS_TEXT_ENGLISH = 'Welcome.';

const IDENTITY_KEYWORDS = [
  'who are you',
  'what are you',
  'your name',
  'who is this',
  'about you'
];

const GREETING_KEYWORDS = [
  'hi',
  'hello',
  'hey',
  'good morning',
  'good afternoon',
  'good evening',
  'namaste',
  'namaskar',
  'kem cho',
  'vanakkam',
  'namaskara',
  'nomoshkar',
  'salaam',
  'assalamualaikum',
  'sat sri akal',
  'hola',
  'bonjour',
  'hallo',
  'ciao',
  'ola',
  'konnichiwa',
  'ni hao',
  'annyeong',
  'privet',
  'selamat'
];

const THANKS_KEYWORDS = [
  'thanks',
  'thank you',
  'dhanyavaad',
  'dhanyavad',
  'shukriya',
  'aabhar',
  'merci',
  'gracias',
  'danke',
  'grazie',
  'obrigado'
];

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

  if (isShort && !looksLikeQuestion && hasKeyword(normalized, GREETING_KEYWORDS)) {
    return 'greeting';
  }

  if (isShort && !looksLikeQuestion && hasKeyword(normalized, THANKS_KEYWORDS)) {
    return 'thanks';
  }

  if (hasKeyword(normalized, IDENTITY_KEYWORDS)) {
    return 'identity';
  }

  return 'question';
}

export async function buildGreetingReply(language, style = 'standard') {
  if (style === 'hinglish') return 'Hi.';
  return translateText(GREETING_TEXT_ENGLISH, language, { style, concise: true });
}

export async function buildThanksReply(language, style = 'standard') {
  if (style === 'hinglish') return 'Welcome.';
  return translateText(THANKS_TEXT_ENGLISH, language, { style, concise: true });
}

export async function buildIdentityReply(language, style = 'standard') {
  const IDENTITY_TEXT_ENGLISH = 'I am the official ADYPU AI Assistant, designed to help you with university information. How can I assist you today?';
  if (style === 'hinglish') return 'Main ADYPU ka official AI Assistant hoon. Main aapki kya madad kar sakta hoon?';
  return translateText(IDENTITY_TEXT_ENGLISH, language, { style, concise: true });
}
