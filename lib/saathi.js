export const SAATHI_IDENTITY =
  'ADYPU Saathi — the official multilingual campus assistant for Ajeenkya DY Patil University (ADYPU), Pune.';

export const SAATHI_SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', option: '1' },
  { code: 'hi', label: 'हिंदी (Hindi)', option: '2' },
  { code: 'mr', label: 'मराठी (Marathi)', option: '3' },
  { code: 'bn', label: 'বাংলা (Bengali)', option: '4' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', option: '5' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', option: '6' },
  { code: 'raj', label: 'राजस्थानी (Rajasthani)', option: '7' },
  { code: 'ta', label: 'தமிழ் (Tamil)', option: '8' },
  { code: 'te', label: 'తెలుగు (Telugu)', option: '9' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', option: '10' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', option: '11' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', option: '12' },
  { code: 'as', label: 'অসমীয়া (Assamese)', option: '13' },
  { code: 'ur', label: 'اردو (Urdu)', option: '14' }
];

export const SAATHI_LANGUAGE_WELCOME_BLOCK = `ADYPU Saathi — आपका स्वागत है | Welcome | स्वागत आहे | স্বাগতম | સ્વાગત છે | ਸੁਆਗਤ ਹੈ | राम राम सा
Please select your language / कृपया अपनी भाषा चुनें:
1. English
2. हिंदी (Hindi)
3. मराठी (Marathi)
4. বাংলা (Bengali)
5. ગુજરાતી (Gujarati)
6. ਪੰਜਾਬੀ (Punjabi)
7. राजस्थानी (Rajasthani)
8. தமிழ் (Tamil)
9. తెలుగు (Telugu)
10. ಕನ್ನಡ (Kannada)
11. മലയാളം (Malayalam)
12. ଓଡ଼ିଆ (Odia)
13. অসমীয়া (Assamese)
14. اردو (Urdu)`;

export const SAATHI_CONSENT_PROMPT_EN = `Before we proceed, ADYPU Saathi needs your consent to collect basic session data (text inputs and session metadata) to provide accurate assistance. This is in accordance with ADYPU's data protection policy.

Reply:
1) I Agree - Proceed
2) I Decline - I understand some features may be limited`;

export const SAATHI_MENU_EN = `ADYPU Saathi — Please choose a topic:
1. Admissions
2. Fees
3. Courses
4. Campus Life
5. Events
6. Clubs
7. Student Council
8. Contacts

You can also type your question directly in any supported language.`;

export const SAATHI_REPHRASE_EN =
  `I'm sorry, I couldn't fully understand your query. Could you rephrase it? You can also type MENU to see the available topics.`;

export const SAATHI_OUT_OF_SCOPE_EN =
  `I don't have that information right now. Please contact info@adypu.edu.in or call +91-8956487911.`;

export const SAATHI_HUMAN_ESCALATION_EN =
  `I'm really sorry you're facing this. Please contact info@adypu.edu.in or call +91-8956487911. For student support, you can also email ssd@adypu.edu.in.`;

export const SAATHI_AUDIO_PROMPT_EN = `Press 1 to hear this in audio.`;

function normalize(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function parseLanguageSelection(message) {
  const msg = normalize(message);
  const option = msg.match(/^(?:language\s*)?([1-9]|1[0-4])$/)?.[1];
  if (option) return SAATHI_SUPPORTED_LANGUAGES.find((l) => l.option === option)?.code || null;

  if (msg === 'english' || msg === 'en') return 'en';
  if (msg === 'hindi' || msg === 'हिंदी' || msg === 'hi') return 'hi';
  if (msg === 'marathi' || msg === 'मराठी' || msg === 'mr') return 'mr';
  if (msg === 'bengali' || msg === 'বাংলা' || msg === 'bn') return 'bn';
  if (msg === 'gujarati' || msg === 'ગુજરાતી' || msg === 'gu') return 'gu';
  if (msg === 'punjabi' || msg === 'ਪੰਜਾਬੀ' || msg === 'pa') return 'pa';
  if (msg === 'rajasthani' || msg === 'राजस्थानी' || msg === 'raj') return 'raj';
  if (msg === 'tamil' || msg === 'தமிழ்' || msg === 'ta') return 'ta';
  if (msg === 'telugu' || msg === 'తెలుగు' || msg === 'te') return 'te';
  if (msg === 'kannada' || msg === 'ಕನ್ನಡ' || msg === 'kn') return 'kn';
  if (msg === 'malayalam' || msg === 'മലയാളം' || msg === 'ml') return 'ml';
  if (msg === 'odia' || msg === 'oriya' || msg === 'ଓଡ଼ିଆ' || msg === 'or') return 'or';
  if (msg === 'assamese' || msg === 'অসমীয়া' || msg === 'as') return 'as';
  if (msg === 'urdu' || msg === 'اردو' || msg === 'ur') return 'ur';

  return null;
}

export function parseConsentSelection(message) {
  const msg = normalize(message);
  if (msg === '1' || msg.includes('i agree') || msg.includes('agree') || msg.includes('yes')) return 'agree';
  if (msg === '2' || msg.includes('decline') || msg.includes('no')) return 'decline';
  return null;
}

export function isMenuCommand(message) {
  const msg = normalize(message);
  return msg === 'menu' || msg === 'help';
}

export function isShowDataCommand(message) {
  const msg = normalize(message);
  return msg === 'show my data' || msg === 'show data';
}

export function isDeleteDataCommand(message) {
  const msg = normalize(message);
  return msg === 'delete my data' || msg === 'delete data';
}

export function isAudioCommand(message) {
  const msg = normalize(message);
  return msg === '1' || msg === 'audio' || msg === 'listen';
}
