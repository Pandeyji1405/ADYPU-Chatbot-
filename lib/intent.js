const MENU_INTENT_MAP = new Map([
  ['1', 'INT-01'],
  ['2', 'INT-02'],
  ['3', 'INT-03'],
  ['4', 'INT-04'],
  ['5', 'INT-05'],
  ['6', 'INT-06'],
  ['7', 'INT-07'],
  ['8', 'INT-08'],
  ['9', 'INT-09'],
  ['10', 'INT-10'],
  ['11', 'INT-11'],
  ['12', 'INT-12'],
  ['13', 'INT-13'],
  ['14', 'INT-14'],
  ['15', 'INT-15'],
  ['16', 'INT-16']
]);

function normalize(message) {
  return String(message || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s#@.+-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesAny(message, patterns) {
  return patterns.some((pattern) => pattern.test(message));
}

export function classifyIntentId(message) {
  const text = normalize(message);
  if (!text) return 'INT-18';

  const menuChoice = text.match(/^(\d{1,2})$/)?.[1];
  if (menuChoice && MENU_INTENT_MAP.has(menuChoice)) return MENU_INTENT_MAP.get(menuChoice);

  // Emergency first
  if (
    matchesAny(text, [
      /\bemergency\b/,
      /\burgent\b/,
      /\bhelp\b/,
      /\baccident\b/,
      /\bcomplaint\b/,
      /आपात/,
      /आपत्ति/,
      /तुरंत/,
      /तत्काल/,
      /emr\b/
    ])
  ) {
    return 'INT-12';
  }

  if (matchesAny(text, [/\bfee\b/, /\bfees\b/, /\btuition\b/, /\binstallment\b/, /फीस/, /शुल्क/])) return 'INT-01';
  if (matchesAny(text, [/\bcourse\b/, /\bcourses\b/, /\bprogram\b/, /\bprogramme\b/, /\bspeciali[sz]ation\b/, /\bb\.?tech\b/, /\bmba\b/, /\bbba\b/, /\bbca\b/, /कोर्स/, /प्रोग्राम/])) {
    return 'INT-02';
  }
  if (matchesAny(text, [/\badmission\b/, /\bapply\b/, /\bacet\b/, /\bentrance\b/, /\bcounsel+ing\b/, /प्रवेश/, /एडमिशन/, /आवेदन/])) return 'INT-03';
  if (matchesAny(text, [/\bscholarship\b/, /\bfinancial aid\b/, /\bwaiver\b/, /स्कॉलरशिप/, /छात्रवृत्ति/])) return 'INT-04';
  if (matchesAny(text, [/\bexam\b/, /\bresult\b/, /\bbacklog\b/, /\btimetable\b/, /\bacademic calendar\b/, /\bcgpa\b/, /परीक्षा/, /रिजल्ट/, /परिणाम/])) return 'INT-05';
  if (matchesAny(text, [/\blibrary\b/, /\bbooks?\b/, /\bdigital resources\b/, /लाइब्रेरी/, /पुस्तकालय/])) return 'INT-06';
  if (matchesAny(text, [/\bhostel\b/, /\baccommodation\b/, /\bwarden\b/, /\bmess\b/, /हॉस्टल/, /मेस/])) return 'INT-07';
  if (matchesAny(text, [/\bcontact\b/, /\bphone\b/, /\bnumber\b/, /\bemail\b/, /\bdirectory\b/, /संपर्क/, /फोन/, /ईमेल/])) return 'INT-08';
  if (matchesAny(text, [/\bevent\b/, /\bfest\b/, /\bclub\b/, /alchemy\b/, /impetus\b/, /ablaze\b/, /#tech\b/, /इवेंट/, /क्लब/])) return 'INT-09';
  if (matchesAny(text, [/\bstudent council\b/, /\bcouncil\b/, /\bpresident\b/, /\bssd\b.*\bcouncil\b/])) return 'INT-10';
  if (matchesAny(text, [/\bplacement\b/, /\binternship\b/, /\bpackage\b/, /\blpa\b/, /\bcareer\b/, /प्लेसमेंट/, /इंटर्नशिप/])) return 'INT-11';
  if (matchesAny(text, [/\blost\b/, /\bfound\b/, /khoya\b/, /mila\b/, /खोया/, /मिला/])) return 'INT-13';
  if (matchesAny(text, [/\bnss\b/, /\bvolunteer\b/, /\bcommunity\b/, /एनएसएस/, /स्वयंसेव/])) return 'INT-14';
  if (matchesAny(text, [/\bph\.?d\b/, /\bdoctoral\b/, /\bdoctorate\b/, /\bpet\b/, /पीएचडी/, /डॉक्ट/])) return 'INT-15';
  if (matchesAny(text, [/\bchancellor\b/, /\bvice chancellor\b/, /\bregistrar\b/, /\bgoverning\b/, /कुलपति/, /रजिस्ट्रार/, /चांसलर/])) return 'INT-16';

  return 'INT-18';
}

export function intentLabel(intentId) {
  const labels = {
    'INT-01': 'Fee Inquiry',
    'INT-02': 'Course Information',
    'INT-03': 'Admission Process',
    'INT-04': 'Scholarship Information',
    'INT-05': 'Exam & Academic Calendar',
    'INT-06': 'Library Services',
    'INT-07': 'Hostel & Accommodation',
    'INT-08': 'Contact & Faculty Directory',
    'INT-09': 'Campus Events & Clubs',
    'INT-10': 'Student Council',
    'INT-11': 'Placement & Careers',
    'INT-12': 'Emergency & Safety',
    'INT-13': 'Lost & Found',
    'INT-14': 'NSS & Social Initiatives',
    'INT-15': 'Ph.D. / Doctoral Programs',
    'INT-16': 'Governing Body / Leadership',
    'INT-17': 'General Greetings / Small Talk',
    'INT-18': 'Unknown / Ambiguous'
  };
  return labels[intentId] || labels['INT-18'];
}

