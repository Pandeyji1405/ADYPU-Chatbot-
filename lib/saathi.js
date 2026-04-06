export const SAATHI_IDENTITY = 'ADYPU Saathi — the official multilingual AI assistant for ADYPU (Ajeenkya DY Patil University), Pune.';

export const SAATHI_SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', option: '1' },
  { code: 'hi', label: 'हिंदी (Hindi)', option: '2' },
  { code: 'mr', label: 'मराठी (Marathi)', option: '3' },
  { code: 'bn', label: 'বাংলা (Bengali)', option: '4' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', option: '5' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', option: '6' },
  { code: 'raj', label: 'राजस्थानी (Rajasthani)', option: '7' }
];

export const SAATHI_LANGUAGE_WELCOME_BLOCK = `ADYPU Saathi — आपका स्वागत है | Welcome | स्वागत आहे | স্বাগতম | સ્વાગત છે | ਸੁਆਗਤ ਹੈ | राम राम सा
Please select your language / कृपया अपनी भाषा चुनें:
1. English
2. हिंदी (Hindi)
3. मराठी (Marathi)
4. বাংলা (Bengali)
5. ગુજરાતી (Gujarati)
6. ਪੰਜਾਬੀ (Punjabi)
7. राजस्थानी (Rajasthani)`;

export const SAATHI_CONSENT_PROMPT_EN = `Before we proceed, ADYPU Saathi needs your consent to collect basic session data (text inputs and session metadata) to provide accurate assistance. This is in accordance with ADYPU’s data protection policy.

Reply:
1) I Agree — Proceed
2) I Decline — I understand some features may be limited`;

export const SAATHI_MENU_EN = `ADYPU Saathi — What can I help you with?
1. Fee Structure & Payments
2. Courses & Programs
3. Admissions & ACET
4. Scholarships
5. Exams & Academic Calendar
6. Library Services
7. Hostel & Accommodation
8. Contact Directory
9. Campus Events & Clubs
10. Student Council
11. Placements & Careers
12. Emergency Help
13. Lost & Found
14. NSS & Social Initiatives
15. Ph.D. / Doctoral Programs
16. University Leadership
Type a number or describe your query in any language.`;

export const SAATHI_REPHRASE_EN = `I’m sorry, I couldn’t fully understand your query. Could you please rephrase it? You can also type MENU to see all available topics.`;

export const SAATHI_OUT_OF_SCOPE_EN = `I don’t have that information right now. Please contact info@adypu.edu.in or call +91-8956487911 for assistance.`;

export const SAATHI_HUMAN_ESCALATION_EN = `I’ll connect you with a Student Service Division representative. Please hold or email ssd@adypu.edu.in.`;

export const SAATHI_AUDIO_PROMPT_EN = `Press 1 to hear this in audio.`;

function normalize(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function parseLanguageSelection(message) {
  const msg = normalize(message);
  const option = msg.match(/^(?:language\s*)?([1-7])$/)?.[1];
  if (option) return SAATHI_SUPPORTED_LANGUAGES.find((l) => l.option === option)?.code || null;

  if (msg === 'english' || msg === 'en') return 'en';
  if (msg === 'hindi' || msg === 'हिंदी' || msg === 'hi') return 'hi';
  if (msg === 'marathi' || msg === 'मराठी' || msg === 'mr') return 'mr';
  if (msg === 'bengali' || msg === 'বাংলা' || msg === 'bn') return 'bn';
  if (msg === 'gujarati' || msg === 'ગુજરાતી' || msg === 'gu') return 'gu';
  if (msg === 'punjabi' || msg === 'ਪੰਜਾਬੀ' || msg === 'pa') return 'pa';
  if (msg === 'rajasthani' || msg === 'राजस्थानी' || msg === 'raj') return 'raj';

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

