import OpenAI from 'openai';
import { FALLBACK_ENGLISH } from './constants.js';
import { SUPPORTED_LANGUAGE_CODES } from './language-support.js';

const FALLBACK_TRANSLATIONS = {
  as: 'মোৰ ওচৰত এতিয়া সেই তথ্য উপলব্ধ নাই। অনুগ্ৰহ কৰি info@adypu.edu.in-ত যোগাযোগ কৰক বা সহায়ৰ বাবে +91-8956487911 নম্বৰত কল কৰক।',
  bn: 'দুঃখিত, এই মুহূর্তে আমার কাছে সেই তথ্য নেই। অনুগ্রহ করে info@adypu.edu.in এ যোগাযোগ করুন অথবা +91-8956487911 নম্বরে কল করুন।',
  en: FALLBACK_ENGLISH,
  gu: 'મારી પાસે હાલમાં તે માહિતી ઉપલબ્ધ નથી. કૃપા કરીને info@adypu.edu.in પર સંપર્ક કરો અથવા +91-8956487911 પર કોલ કરો.',
  hi: 'मुझे अभी वह जानकारी उपलब्ध नहीं है। कृपया info@adypu.edu.in पर संपर्क करें या +91-8956487911 पर कॉल करें।',
  kn: 'ಕ್ಷಮಿಸಿ, ಈ ಮಾಹಿತಿಯು ಈಗ ನನ್ನ ಬಳಿ ಲಭ್ಯವಿಲ್ಲ. ಸಹಾಯಕ್ಕಾಗಿ info@adypu.edu.in ಅನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ +91-8956487911 ಗೆ ಕರೆಮಾಡಿ.',
  ml: 'ക്ഷമിക്കണം, ഇപ്പോൾ ആ വിവരം എനിക്ക് ലഭ്യമല്ല. സഹായത്തിനായി info@adypu.edu.in നെ ബന്ധപ്പെടുക അല്ലെങ്കിൽ +91-8956487911 ലേക്ക് വിളിക്കുക.',
  mr: 'माझ्याकडे सध्या ती माहिती उपलब्ध नाही. कृपया info@adypu.edu.in वर संपर्क करा किंवा +91-8956487911 वर कॉल करा.',
  or: 'ମୋ ପାଖରେ ଏବେ ସେହି ସୂଚନା ନାହିଁ। ଦୟାକରି info@adypu.edu.in ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ କିମ୍ବା +91-8956487911 କୁ କଲ୍ କରନ୍ତୁ।',
  pa: 'ਮਾਫ ਕਰਨਾ, ਇਸ ਵੇਲੇ ਮੇਰੇ ਕੋਲ ਉਹ ਜਾਣਕਾਰੀ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ info@adypu.edu.in ਤੇ ਸੰਪਰਕ ਕਰੋ ਜਾਂ +91-8956487911 ਤੇ ਕਾਲ ਕਰੋ।',
  raj: 'म्हारे पास अभी ई जानकारी उपलब्ध नहीं है। कृपया सहायता खातिर info@adypu.edu.in पर संपर्क करो या +91-8956487911 पर कॉल करो।',
  ta: 'மன்னிக்கவும், இப்போது அந்த தகவல் என்னிடம் இல்லை. உதவிக்கு info@adypu.edu.in-ஐ தொடர்பு கொள்ளவும் அல்லது +91-8956487911-க்கு அழைக்கவும்.',
  te: 'క్షమించండి, ప్రస్తుతం ఆ సమాచారం నా వద్ద లేదు. సహాయానికి info@adypu.edu.in ను సంప్రదించండి లేదా +91-8956487911 కు కాల్ చేయండి.',
  ur: 'معذرت، اس وقت میرے پاس وہ معلومات نہیں ہیں۔ براہ کرم info@adypu.edu.in پر رابطہ کریں یا +91-8956487911 پر کال کریں۔'
};

const HINGLISH_MARKERS = [
  ' kya ',
  ' kaise ',
  ' kaun ',
  ' kahan ',
  ' kab ',
  ' hai ',
  ' nahi ',
  ' nhi ',
  ' kr ',
  ' karo ',
  ' batao ',
  ' bataye ',
  ' mujhe ',
  ' aap ',
  ' tum '
];

const STRONG_HINGLISH_MARKERS = [' kya ', ' kaise ', ' kaun ', ' kahan ', ' kab ', ' mujhe '];

const GOOGLE_TRANSLATE_SUPPORTED_CODES = new Set([
  'as',
  'bn',
  'en',
  'gu',
  'hi',
  'kn',
  'ml',
  'mr',
  'or',
  'pa',
  'ta',
  'te',
  'ur'
]);

function normalizeLanguageCode(input) {
  const candidate = String(input || '').toLowerCase().trim().replace('_', '-');
  if (!candidate) return 'en';

  const aliases = {
    assamese: 'as',
    bengali: 'bn',
    english: 'en',
    gujarati: 'gu',
    hindi: 'hi',
    kannada: 'kn',
    malayalam: 'ml',
    marathi: 'mr',
    odia: 'or',
    oriya: 'or',
    punjabi: 'pa',
    rajasthani: 'raj',
    tamil: 'ta',
    telugu: 'te',
    urdu: 'ur'
  };

  if (aliases[candidate]) return aliases[candidate];

  const base = candidate.split('-')[0];
  if (/^[a-z]{2,3}$/.test(base)) return base;
  return 'en';
}

function hasScript(text, start, end) {
  for (const char of String(text || '')) {
    const code = char.codePointAt(0);
    if (code >= start && code <= end) return true;
  }
  return false;
}

function includesAny(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function localLanguageHeuristic(text) {
  if (!text || typeof text !== 'string') return 'en';

  const lowered = ` ${text.toLowerCase()} `;

  if (hasScript(text, 0x0980, 0x09ff)) {
    if (includesAny(lowered, [' আপোনাক ', ' মই ', ' কেনেকৈ ', ' নাইনে ', ' অসমীয়া '])) return 'as';
    return 'bn';
  }
  if (hasScript(text, 0x0a00, 0x0a7f)) return 'pa';
  if (hasScript(text, 0x0a80, 0x0aff)) return 'gu';
  if (hasScript(text, 0x0b00, 0x0b7f)) return 'or';
  if (hasScript(text, 0x0b80, 0x0bff)) return 'ta';
  if (hasScript(text, 0x0c00, 0x0c7f)) return 'te';
  if (hasScript(text, 0x0c80, 0x0cff)) return 'kn';
  if (hasScript(text, 0x0d00, 0x0d7f)) return 'ml';

  if (hasScript(text, 0x0900, 0x097f)) {
    if (includesAny(lowered, [' काय ', ' आहे ', ' मला ', ' मध्ये ', ' मराठी '])) return 'mr';
    if (includesAny(lowered, [' म्हारो ', ' म्हारे ', ' थाने ', ' राजस्थानी '])) return 'raj';
    return 'hi';
  }

  if (hasScript(text, 0x0600, 0x06ff)) return 'ur';

  if (includesAny(lowered, [' fees kitni hai ', ' admission kaise ', ' mujhe ', ' batao '])) return 'hi';
  if (includesAny(lowered, [' fees kiti ahet ', ' mala ', ' marathi '])) return 'mr';
  if (includesAny(lowered, [' tame ', ' gujarati ', ' shu '])) return 'gu';
  if (includesAny(lowered, [' tusi ', ' punjabi ', ' kida '])) return 'pa';
  if (includesAny(lowered, [' tamil ', ' vanakkam '])) return 'ta';
  if (includesAny(lowered, [' telugu ', ' namaskaram '])) return 'te';
  if (includesAny(lowered, [' kannada ', ' namaskara '])) return 'kn';
  if (includesAny(lowered, [' malayalam ', ' namaskaram '])) return 'ml';
  if (includesAny(lowered, [' odia ', ' oriya '])) return 'or';
  if (includesAny(lowered, [' assamese ', ' axomiya '])) return 'as';
  if (includesAny(lowered, [' urdu '])) return 'ur';

  return 'en';
}

async function geminiGenerate(prompt) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return null;
  }
}

async function googleTranslateRequest(endpoint, payload) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2/${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function googleDetectLanguage(text) {
  if (!process.env.GOOGLE_TRANSLATE_API_KEY || !text) return null;
  const data = await googleTranslateRequest('detect', { q: text });
  const detected = data?.data?.detections?.[0]?.[0]?.language;
  return detected ? normalizeLanguageCode(detected) : null;
}

async function googleTranslateText(text, targetLanguage) {
  const normalizedTarget = normalizeLanguageCode(targetLanguage);
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) return null;
  if (!GOOGLE_TRANSLATE_SUPPORTED_CODES.has(normalizedTarget)) return null;

  const data = await googleTranslateRequest('', {
    q: text,
    target: normalizedTarget,
    format: 'text'
  });

  const translated = data?.data?.translations?.[0]?.translatedText;
  return translated ? decodeHtmlEntities(translated) : null;
}

export async function detectLanguage(text) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!openaiKey && !geminiKey && !googleKey) return localLanguageHeuristic(text);

  if (googleKey) {
    const code = await googleDetectLanguage(text);
    if (code && SUPPORTED_LANGUAGE_CODES.has(code)) return code;
  }

  const prompt = `Return only an ISO 639-1 or ISO 639-2 language code for the user text. If text is Hinglish (Roman Hindi), return hi. Examples: en, hi, mr, ta, te, kn, ml, or, as, ur, raj. No extra words. Text: ${text}`;

  if (geminiKey) {
    const code = await geminiGenerate(prompt);
    const normalized = normalizeLanguageCode(code);
    if (/^[a-z]{2,3}$/.test(normalized)) return normalized;
  }

  if (openaiKey) {
    try {
      const client = new OpenAI({ apiKey: openaiKey });
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_DETECT_MODEL || 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 10,
        messages: [
          {
            role: 'system',
            content: 'Return only an ISO 639-1 or ISO 639-2 language code for the user text. If text is Hinglish (Roman Hindi), return hi. Examples: en, hi, mr, ta, te, kn, ml, or, as, ur, raj. No extra words.'
          },
          { role: 'user', content: text }
        ]
      });
      const modelCode = normalizeLanguageCode(response.choices?.[0]?.message?.content);
      if (/^[a-z]{2,3}$/.test(modelCode)) return modelCode;
    } catch {
      // fall through
    }
  }

  return localLanguageHeuristic(text);
}

export function detectResponseStyle(text, language = 'en') {
  const lowered = ` ${String(text || '').toLowerCase().replace(/\s+/g, ' ').trim()} `;
  const markerHits = HINGLISH_MARKERS.reduce((count, marker) => count + (lowered.includes(marker) ? 1 : 0), 0);
  const hasStrongMarker = STRONG_HINGLISH_MARKERS.some((marker) => lowered.includes(marker));

  if (lowered.includes(' hinglish ') || hasStrongMarker || markerHits >= 2) return 'hinglish';

  if (
    lowered.includes(' short form ') ||
    lowered.includes(' shortform ') ||
    lowered.includes(' in short ') ||
    lowered.includes(' short reply ') ||
    lowered.includes(' concise ')
  ) {
    return 'short';
  }

  if (language === 'hi' && !hasScript(text || '', 0x0900, 0x097f) && markerHits >= 2) return 'hinglish';

  return 'standard';
}

function manualTranslate(text, targetLanguage) {
  if (targetLanguage === 'en') return text;
  if (text === FALLBACK_ENGLISH && FALLBACK_TRANSLATIONS[targetLanguage]) return FALLBACK_TRANSLATIONS[targetLanguage];
  return text;
}

export async function translateText(text, targetLanguage, options = {}) {
  const normalizedTarget = normalizeLanguageCode(targetLanguage);
  const style = options.style || 'standard';
  const concise = Boolean(options.concise);

  if (!text) return text;
  if (normalizedTarget === 'en' && style !== 'hinglish') return text;

  // Prefer Google Cloud Translation for supported Indian languages in standard script mode.
  if (style !== 'hinglish') {
    const googleTranslated = await googleTranslateText(text, normalizedTarget);
    if (googleTranslated) return googleTranslated;
  }

  const styleNote =
    style === 'hinglish'
      ? 'Output in natural Roman Hindi (Hinglish), not Devanagari script. Keep short forms like SSD, SoD, VC.'
      : 'Use the target language script naturally.';
  const conciseNote = concise ? 'Keep output short and direct. No extra explanation.' : 'Return only translated text.';
  const translatePrompt = `Translate the text to target language. Keep names, numbers, URLs, addresses unchanged. ${styleNote} ${conciseNote}\ntarget_language=${normalizedTarget}\nstyle=${style}\ntext=${text}`;

  if (process.env.GEMINI_API_KEY) {
    const translated = await geminiGenerate(translatePrompt);
    if (translated) return translated;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const client = new OpenAI({ apiKey: openaiKey });
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `Translate the text to the requested target language. Keep names, @handles, numbers, URLs, and addresses unchanged. ${styleNote} ${conciseNote}`
          },
          { role: 'user', content: `target_language=${normalizedTarget}\nstyle=${style}\ntext=${text}` }
        ]
      });
      const translated = response.choices?.[0]?.message?.content?.trim();
      if (translated) return translated;
    } catch {
      // fall through
    }
  }

  return manualTranslate(text, normalizedTarget);
}

export async function translateFallback(lang) {
  const normalized = normalizeLanguageCode(lang);
  if (normalized === 'en') return FALLBACK_ENGLISH;

  const translated = await translateText(FALLBACK_ENGLISH, normalized, { concise: true });
  return translated || FALLBACK_ENGLISH;
}

export function normalizeDetectedLanguage(input) {
  const normalized = normalizeLanguageCode(input);
  if (SUPPORTED_LANGUAGE_CODES.has(normalized)) return normalized;
  return 'en';
}
