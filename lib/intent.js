const MENU_INTENT_MAP = new Map([
  ['1', 'INT-02'],
  ['2', 'INT-03'],
  ['3', 'INT-04'],
  ['4', 'INT-08'],
  ['5', 'INT-09'],
  ['6', 'INT-10'],
  ['7', 'INT-11'],
  ['8', 'INT-07']
]);

function normalize(message) {
  return String(message || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s#@.+/-]/gu, ' ')
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

  if (matchesAny(text, [/\bhi\b/, /\bhello\b/, /\bhey\b/, /\bnamaste\b/, /\bnamaskar\b/, /\bhru\b/, /\bhow are you\b/])) return 'INT-01';
  if (matchesAny(text, [/\badmission\b/, /\bapply\b/, /\benroll\b/, /\bacet\b/, /\bentrance\b/, /\bdocument\b/, /\bdeadline\b/, /\blast date\b/, /admission kasa/, /admission/])) return 'INT-02';
  if (matchesAny(text, [/\bfee\b/, /\bfees\b/, /\bfee structure\b/, /\bcost\b/, /\btuition\b/, /\binstallment\b/])) return 'INT-03';
  if (matchesAny(text, [/\bpg\b/, /\bpostgraduate\b/, /\bmasters\b/, /\bmaster'?s\b/, /\bmtech\b/, /\bmba\b/, /\bmdes\b/, /\bllm\b/, /\bmarch\b/, /\bmca\b/, /\bma\b/, /\bmsc\b/, /\bpost graduation\b/])) return 'INT-05';
  if (matchesAny(text, [/\bcourse\b/, /\bcourses\b/, /\bprogram\b/, /\bprogramme\b/, /\bdegree\b/, /\bdegrees\b/, /\bmajor\b/, /\bmajors\b/, /\bbranch\b/, /\bbranches\b/, /\bstream\b/, /\bstreams\b/, /\bspeciali[sz]ation\b/, /\bspeciali[sz]ations\b/, /\bug\b/, /\bundergraduate\b/, /\bbtech\b/, /\bbba\b/, /\bbdes\b/, /\bbarch\b/, /\bbca\b/, /\bwhat can i study\b/])) return 'INT-04';
  if (matchesAny(text, [/\bscholarship\b/, /\bfinancial aid\b/, /\bdiscount\b/, /\bwaiver\b/, /\bbeti padhao\b/, /\bsports scholarship\b/, /\bdivyang\b/])) return 'INT-06';
  if (matchesAny(text, [/\b(full form|stand for|meaning|what is)\b.*\b(ssd|sod|spcr)\b/, /\b(ssd|sod|spcr)\b.*\b(full form|stand for|meaning)\b/])) return 'INT-07';
  if (matchesAny(text, [/\bcampus\b/, /\bfacilities\b/, /\bhostel\b/, /\bsports\b/, /\bcafeteria\b/, /\baccommodation\b/, /\bgym\b/])) return 'INT-08';
  if (matchesAny(text, [/\bevent\b/, /\bfest\b/, /\bfestival\b/, /\bablaze\b/, /\bimpetus\b/, /\btech fest\b/, /\balchemy\b/, /\bchatori galli\b/, /\bmoot court\b/, /\bregister\b/])) return 'INT-09';
  if (matchesAny(text, [/\bclub\b/, /\bjoin club\b/, /\bextracurricular\b/, /\bcoding club\b/, /\bdance club\b/, /\bnss\b/, /\brobotics club\b/])) return 'INT-10';
  if (matchesAny(text, [/\bstudent council\b/, /\bcouncil president\b/, /\bwho is president\b/, /\bcouncil members\b/, /\bjoin council\b/])) return 'INT-11';
  if (matchesAny(text, [/\bchancellor\b/, /\bvice chancellor\b/, /\bdean\b/, /\bregistrar\b/, /\bwho runs adypu\b/, /\bgoverning body\b/, /\bfaculty head\b/])) return 'INT-12';
  if (matchesAny(text, [/\bphd\b/, /\bdoctoral\b/, /\bresearch program\b/, /\bpet\b/, /\bthesis\b/, /\bsupervisor\b/, /\bresearch admission\b/])) return 'INT-13';
  if (matchesAny(text, [/\babout adypu\b/, /\bwhat is adypu\b/, /\buniversity info\b/, /\blocation\b/, /\bachievements\b/, /\brankings\b/, /\bnews\b/])) return 'INT-14';
  if (matchesAny(text, [/\bplacement\b/, /\bjob\b/, /\bcareer\b/, /\bpackage\b/, /\bsalary\b/, /\bhighest package\b/, /\baverage package\b/])) return 'INT-15';
  if (matchesAny(text, [/\bwho handles placements\b/, /\bplacements page\b/, /\bplacements link\b/])) return 'INT-15';
  if (matchesAny(text, [/\bcontact\b/, /\bphone\b/, /\bemail\b/, /\bhelpline\b/, /\bnumber\b/, /\bcall\b/, /\breach\b/])) return 'INT-07';
  if (matchesAny(text, [/\bnot helpful\b/, /\buseless\b/, /\bwrong info\b/, /\bfrustrated\b/, /\burgent\b/, /\bemergency\b/, /\bragging\b/, /\bharassment\b/, /\bconfused\b/, /\blost\b/])) return 'INT-16';

  const hasIndicScript = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF]/.test(text);
  if (hasIndicScript) return 'INT-17';

  return 'INT-18';
}

export function intentLabel(intentId) {
  const labels = {
    'INT-01': 'Greetings',
    'INT-02': 'Admissions',
    'INT-03': 'Fees',
    'INT-04': 'Undergraduate Courses',
    'INT-05': 'Postgraduate Courses',
    'INT-06': 'Scholarships',
    'INT-07': 'Contacts & Helpline',
    'INT-08': 'Campus Life & Facilities',
    'INT-09': 'Events',
    'INT-10': 'Clubs',
    'INT-11': 'Student Council',
    'INT-12': 'Governing Body & Deans',
    'INT-13': 'PhD & Doctoral Programs',
    'INT-14': 'About ADYPU',
    'INT-15': 'Placements & Careers',
    'INT-16': 'Complaints / Escalation',
    'INT-17': 'Multilingual Trigger',
    'INT-18': 'Out of Scope'
  };
  return labels[intentId] || labels.INT-18;
}
