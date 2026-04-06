import OpenAI from 'openai';
import { FALLBACK_ENGLISH } from './constants.js';
import { SUPPORTED_LANGUAGE_CODES } from './language-support.js';

const FALLBACK_TRANSLATIONS = {
  ar: 'عذرًا، لا تتوفر لدي هذه المعلومة الآن. يُرجى التواصل على info@adypu.edu.in أو الاتصال على +91-8956487911 للمساعدة.',
  bn: 'দুঃখিত, এই মুহূর্তে আমার কাছে সেই তথ্য নেই। সহায়তার জন্য অনুগ্রহ করে info@adypu.edu.in এ যোগাযোগ করুন অথবা +91-8956487911 নম্বরে কল করুন।',
  de: 'Ich habe diese Information derzeit nicht. Bitte kontaktieren Sie info@adypu.edu.in oder rufen Sie +91-8956487911 an.',
  es: 'No tengo esa información en este momento. Por favor, contacta a info@adypu.edu.in o llama al +91-8956487911.',
  fr: 'Je n’ai pas cette information pour le moment. Veuillez contacter info@adypu.edu.in ou appeler le +91-8956487911.',
  gu: 'મારી પાસે હાલમાં તે માહિતી ઉપલબ્ધ નથી. કૃપા કરીને મદદ માટે info@adypu.edu.in પર સંપર્ક કરો અથવા +91-8956487911 પર કૉલ કરો.',
  hi: 'मुझे अभी वह जानकारी उपलब्ध नहीं है। कृपया सहायता के लिए info@adypu.edu.in पर संपर्क करें या +91-8956487911 पर कॉल करें।',
  kn: 'ಕ್ಷಮಿಸಿ, ಈ ಮಾಹಿತಿಯು ಈ ಸಮಯದಲ್ಲಿ ನನಗೆ ಲಭ್ಯವಿಲ್ಲ. ಸಹಾಯಕ್ಕಾಗಿ info@adypu.edu.in ಅನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ +91-8956487911 ಗೆ ಕರೆಮಾಡಿ.',
  ml: 'ക്ഷമിക്കണം, ഇപ്പോള്‍ ആ വിവരം എനിക്ക് ലഭ്യമല്ല. സഹായത്തിനായി info@adypu.edu.in നെ ബന്ധപ്പെടുക അല്ലെങ്കില്‍ +91-8956487911 ലേക്ക് വിളിക്കുക.',
  mr: 'माझ्याकडे सध्या ती माहिती उपलब्ध नाही. कृपया मदतीसाठी info@adypu.edu.in वर संपर्क करा किंवा +91-8956487911 या क्रमांकावर कॉल करा.',
  pa: 'ਮਾਫ ਕਰਨਾ, ਇਸ ਵੇਲੇ ਮੇਰੇ ਕੋਲ ਉਹ ਜਾਣਕਾਰੀ ਨਹੀਂ ਹੈ। ਮਦਦ ਲਈ ਕਿਰਪਾ ਕਰਕੇ info@adypu.edu.in ‘ਤੇ ਸੰਪਰਕ ਕਰੋ ਜਾਂ +91-8956487911 ‘ਤੇ ਕਾਲ ਕਰੋ।',
  pt: 'Nao tenho essa informacao no momento. Por favor, entre em contato com info@adypu.edu.in ou ligue para +91-8956487911.',
  ru: 'U menya seichas net etoi informatsii. Pozhaluista, svyazhites s info@adypu.edu.in ili pozvonite po +91-8956487911.',
  ta: 'மன்னிக்கவும், இப்போது அந்த தகவல் என்னிடம் இல்லை. உதவிக்கு info@adypu.edu.in-ஐ தொடர்பு கொள்ளவும் அல்லது +91-8956487911-க்கு அழைக்கவும்.',
  te: 'క్షమించండి, ప్రస్తుతం ఆ సమాచారం నా వద్ద లేదు. సహాయానికి info@adypu.edu.in ను సంప్రదించండి లేదా +91-8956487911 కు కాల్ చేయండి.',
  ur: 'معذرت، اس وقت میرے پاس وہ معلومات نہیں ہیں۔ مدد کے لیے براہ کرم info@adypu.edu.in پر رابطہ کریں یا +91-8956487911 پر کال کریں۔',
  zh: '抱歉，我目前没有这方面的信息。请联系 info@adypu.edu.in 或致电 +91-8956487911 获取帮助。'
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

function normalizeLanguageCode(input) {
  const candidate = (input || '').toLowerCase().trim().replace('_', '-');
  if (!candidate) return 'en';

  const base = candidate.split('-')[0];
  if (/^[a-z]{2,3}$/.test(base)) return base;
  return 'en';
}

function hasScript(text, start, end) {
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code >= start && code <= end) return true;
  }
  return false;
}

function includesAny(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

function localLanguageHeuristic(text) {
  if (!text || typeof text !== 'string') return 'en';

  const lowered = ` ${text.toLowerCase()} `;

  if (hasScript(text, 0x0980, 0x09ff)) return 'bn';
  if (hasScript(text, 0x0a00, 0x0a7f)) return 'pa';
  if (hasScript(text, 0x0a80, 0x0aff)) return 'gu';
  if (hasScript(text, 0x0b00, 0x0b7f)) return 'or';
  if (hasScript(text, 0x0b80, 0x0bff)) return 'ta';
  if (hasScript(text, 0x0c00, 0x0c7f)) return 'te';
  if (hasScript(text, 0x0c80, 0x0cff)) return 'kn';
  if (hasScript(text, 0x0d00, 0x0d7f)) return 'ml';

  if (hasScript(text, 0x0900, 0x097f)) {
    if (includesAny(lowered, [' काय ', ' आहे ', ' मला ', ' मध्ये ', ' मराठी '])) return 'mr';
    if (includesAny(lowered, [' नेपाली ', ' तपाई ', ' कस्तो छ '])) return 'ne';
    return 'hi';
  }

  if (hasScript(text, 0x0600, 0x06ff)) {
    if (includesAny(lowered, [' کیا ', ' نہیں ', ' میں ', ' ہے '])) return 'ur';
    return 'ar';
  }

  if (hasScript(text, 0x0400, 0x04ff)) return 'ru';
  if (hasScript(text, 0x4e00, 0x9fff)) return 'zh';
  if (hasScript(text, 0x3040, 0x30ff)) return 'ja';
  if (hasScript(text, 0xac00, 0xd7af)) return 'ko';
  if (hasScript(text, 0x0590, 0x05ff)) return 'he';
  if (hasScript(text, 0x0e00, 0x0e7f)) return 'th';

  if (includesAny(lowered, [' hola ', ' gracias ', ' universidad '])) return 'es';
  if (includesAny(lowered, [' bonjour ', ' merci ', ' universite '])) return 'fr';
  if (includesAny(lowered, [' hallo ', ' danke ', ' universitat '])) return 'de';
  if (includesAny(lowered, [' ola ', ' obrigado ', ' universidade '])) return 'pt';
  if (includesAny(lowered, [' ciao ', ' grazie ', ' universita '])) return 'it';
  if (includesAny(lowered, [' merhaba ', ' tesekkurler '])) return 'tr';
  if (includesAny(lowered, [' xin chao ', ' cam on '])) return 'vi';
  if (includesAny(lowered, [' selamat ', ' terima kasih '])) return 'ms';
  if (includesAny(lowered, [' apa kabar ', ' kasih '])) return 'id';

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

export async function detectLanguage(text) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey && !geminiKey) return localLanguageHeuristic(text);

  const prompt = `Return only an ISO 639-1 language code for the user text. If text is Hinglish (Roman Hindi), return hi. Example: en, hi, mr, fr. No extra words. Text: ${text}`;

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
          { role: 'system', content: 'Return only an ISO 639-1 language code for the user text. If text is Hinglish (Roman Hindi), return hi. Example: en, hi, mr, fr. No extra words.' },
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
  const lowered = ` ${(text || '').toLowerCase().replace(/\s+/g, ' ').trim()} `;
  const markerHits = HINGLISH_MARKERS.reduce((count, marker) => count + (lowered.includes(marker) ? 1 : 0), 0);
  const hasStrongMarker = STRONG_HINGLISH_MARKERS.some((marker) => lowered.includes(marker));

  if (lowered.includes(' hinglish ') || hasStrongMarker || markerHits >= 2) {
    return 'hinglish';
  }

  if (
    lowered.includes(' short form ') ||
    lowered.includes(' shortform ') ||
    lowered.includes(' in short ') ||
    lowered.includes(' short reply ') ||
    lowered.includes(' concise ')
  ) {
    return 'short';
  }

  if (language === 'hi' && !hasScript(text || '', 0x0900, 0x097f) && markerHits >= 2) {
    return 'hinglish';
  }

  return 'standard';
}

function manualTranslate(text, targetLanguage) {
  if (targetLanguage === 'en') return text;

  if (text === FALLBACK_ENGLISH && FALLBACK_TRANSLATIONS[targetLanguage]) {
    return FALLBACK_TRANSLATIONS[targetLanguage];
  }

  return text;
}

export async function translateText(text, targetLanguage, options = {}) {
  const normalizedTarget = normalizeLanguageCode(targetLanguage);
  const style = options.style || 'standard';
  const concise = Boolean(options.concise);

  if (!text) return text;
  if (normalizedTarget === 'en' && style !== 'hinglish') return text;

  const styleNote = style === 'hinglish'
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
  return normalized || 'en';
}
