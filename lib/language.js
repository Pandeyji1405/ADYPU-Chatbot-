import OpenAI from 'openai';
import { FALLBACK_ENGLISH } from './constants.js';
import { SUPPORTED_LANGUAGE_CODES } from './language-support.js';

const FALLBACK_TRANSLATIONS = {
  ar: 'عذرا، لا استطيع فهم استفسارك. لفهم افضل، يرجى التواصل مع President مجلس الطلاب Devesh Pandey (Insta: pandeyji_2901) او زيارة مكتب SSD في ULC 5.',
  bn: 'দুঃখিত, আমি আপনার প্রশ্ন বুঝতে পারছি না। আরও ভালোভাবে বোঝার জন্য Student Council-এর President Devesh Pandey (Insta: pandeyji_2901)-এর সঙ্গে যোগাযোগ করুন অথবা ULC 5-এ SSD office-এ যান।',
  de: 'Entschuldigung, ich kann Ihre Anfrage nicht verstehen. Fuer eine bessere Klaerung kontaktieren Sie bitte den President des Student Council, Devesh Pandey (Insta: pandeyji_2901), oder besuchen Sie das SSD-Buero in ULC 5.',
  es: 'Lo siento, no puedo entender tu consulta. Para una mejor orientacion, contacta al Presidente del Student Council, Devesh Pandey (Insta: pandeyji_2901), o visita la oficina de SSD en ULC 5.',
  fr: 'Desole, je ne peux pas comprendre votre requete. Pour une meilleure orientation, veuillez contacter le President du Student Council, Devesh Pandey (Insta: pandeyji_2901), ou visiter le bureau SSD dans ULC 5.',
  gu: 'માફ કરશો, હું તમારો પ્રશ્ન સમજી શક્યો નથી. વધુ સારી સમજ માટે કૃપા કરીને Student Council ના President Devesh Pandey (Insta: pandeyji_2901) નો સંપર્ક કરો અથવા ULC 5 માં SSD office પર જાઓ.',
  hi: 'माफ कीजिए, मैं आपकी क्वेरी समझ नहीं पा रहा/रही हूं। बेहतर समझ के लिए कृपया Student Council के President Devesh Pandey (Insta: pandeyji_2901) से संपर्क करें या ULC 5 में SSD office जाएं।',
  kn: 'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಿಲ್ಲ. ಉತ್ತಮ ತಿಳುವಳಿಕೆಗೆ Student Council ನ President Devesh Pandey (Insta: pandeyji_2901) ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ULC 5 ನ SSD office ಗೆ ಭೇಟಿ ನೀಡಿ.',
  ml: 'ക്ഷമിക്കണം, നിങ്ങളുടെ ചോദ്യമനിക്ക് മനസ്സിലായില്ല. മികച്ച സഹായത്തിനായി Student Council President Devesh Pandey (Insta: pandeyji_2901) നെ ബന്ധപ്പെടുക അല്ലെങ്കില് ULC 5 ലെ SSD office സന്ദര് ശിക്കുക.',
  mr: 'माफ करा, मला तुमचा प्रश्न समजला नाही. अधिक चांगल्या मार्गदर्शनासाठी कृपया Student Council चे President Devesh Pandey (Insta: pandeyji_2901) यांच्याशी संपर्क करा किंवा ULC 5 मधील SSD office ला भेट द्या.',
  pa: 'ਮਾਫ ਕਰਨਾ, ਮੈਂ ਤੁਹਾਡਾ ਸਵਾਲ ਸਮਝ ਨਹੀਂ ਸਕਿਆ। ਵਧੀਆ ਸਮਝ ਲਈ ਕਿਰਪਾ ਕਰਕੇ Student Council ਦੇ President Devesh Pandey (Insta: pandeyji_2901) ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਜਾਂ ULC 5 ਵਿੱਚ SSD office ਤੇ ਜਾਓ।',
  pt: 'Desculpe, nao consigo entender sua consulta. Para melhor orientacao, entre em contato com o Presidente do Student Council, Devesh Pandey (Insta: pandeyji_2901), ou visite o escritorio SSD no ULC 5.',
  ru: 'Izvinite, ya ne mogu ponyat vas zapros. Dlya luchshego ponimaniya svyazhites s President Student Council Devesh Pandey (Insta: pandeyji_2901) ili posetite ofis SSD v ULC 5.',
  ta: 'மன்னிக்கவும், உங்கள் கேள்வியை நான் புரிந்துகொள்ள முடியவில்லை. மேலும் தெளிவாக அறிய Student Council President Devesh Pandey (Insta: pandeyji_2901) அவர்களை தொடர்பு கொள்ளவும் அல்லது ULC 5 இல் உள்ள SSD office-ஐ அணுகவும்.',
  te: 'క్షమించండి, మీ ప్రశ్నను నేను అర్థం చేసుకోలేకపోయాను. మెరుగైన సహాయం కోసం Student Council President Devesh Pandey (Insta: pandeyji_2901) ను సంప్రదించండి లేదా ULC 5 లోని SSD office ను సందర్శించండి.',
  ur: 'معذرت، میں آپ کا سوال سمجھ نہیں سکا۔ بہتر رہنمائی کے لیے Student Council کے President Devesh Pandey (Insta: pandeyji_2901) سے رابطہ کریں یا ULC 5 میں SSD office جائیں۔',
  zh: '抱歉，我无法理解您的问题。为了更好地帮助您，请联系 Student Council President Devesh Pandey（Insta: pandeyji_2901），或前往 ULC 5 的 SSD office。'
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

export async function detectLanguage(text) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return localLanguageHeuristic(text);
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_DETECT_MODEL || 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 10,
      messages: [
        {
          role: 'system',
          content:
            'Return only an ISO 639-1 language code for the user text. If text is Hinglish (Roman Hindi), return hi. Example: en, hi, mr, fr. No extra words.'
        },
        { role: 'user', content: text }
      ]
    });

    const modelCode = normalizeLanguageCode(response.choices?.[0]?.message?.content);
    if (/^[a-z]{2,3}$/.test(modelCode)) {
      return modelCode;
    }

    return localLanguageHeuristic(text);
  } catch {
    return localLanguageHeuristic(text);
  }
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return manualTranslate(text, normalizedTarget);
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: [
            'Translate the text to the requested target language.',
            'Keep names, @handles, numbers, URLs, and addresses unchanged.',
            style === 'hinglish'
              ? 'Output in natural Roman Hindi (Hinglish), not Devanagari script. Keep common short forms like SSD, SoD, VC.'
              : 'Use the target language script naturally.',
            concise ? 'Keep output short and direct. No extra explanation.' : 'Return only translated text.'
          ].join(' ')
        },
        {
          role: 'user',
          content: `target_language=${normalizedTarget}\nstyle=${style}\ntext=${text}`
        }
      ]
    });

    const translated = response.choices?.[0]?.message?.content?.trim();
    return translated || manualTranslate(text, normalizedTarget);
  } catch {
    return manualTranslate(text, normalizedTarget);
  }
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
