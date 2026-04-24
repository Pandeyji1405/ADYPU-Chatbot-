import { SAATHI_HUMAN_ESCALATION_EN, SAATHI_MENU_EN, SAATHI_OUT_OF_SCOPE_EN, SAATHI_REPHRASE_EN } from './saathi.js';

const ADMISSIONS_CONTACT_BLOCK =
  'General Admissions: +91-8956487911 / +91-8956487916\nEmail: admissions@adypu.edu.in\nOffice Hours: Mon-Fri 9:30AM-5:30PM | Sat 9:30AM-6:30PM | Sun 9:30AM-5:30PM\nApply online: adypu.edu.in/admissions';

const DOCUMENTS_BLOCK =
  'Documents needed: 10th & 12th marksheets, TC, Migration Certificate, photos, ID proof (Aadhar/Passport), caste certificate (if applicable).';

const FEE_PAYMENT_BLOCK =
  'Payment: 2 equal installments - 1st by July 22, 2024 | 2nd by January 2, 2025.';

const FEES_BY_SCHOOL = {
  SOE: 'SOE (Engineering): BTech CSE Cyber Security/Software Engg: ₹3,00,000 | BTech AI & Data Science: ₹3,00,000 | BTech Aeronautical/Aerospace/Avionics: ₹3,00,000 | BTech Mechanical (Auto/3D Print): ₹2,50,000 | BTech Biotech/Biomedical: ₹2,50,000 | BTech Robotics & Automation: ₹2,50,000 | BTech CSE VR & AR: ₹3,50,000 | BTech CSE Cyber Forensic: ₹3,50,000 | Integrated BTech+MTech Aerospace/Defence: ₹3,50,000 | MTech Bio Engg/AI & ML/Robotics: ₹2,30,000 | MTech Space Tech/Infrastructure: ₹2,50,000',
  SOM: 'SOM (Management): BBA Sales/Marketing/Finance/Fintech: ₹2,30,000 | BBA Business Analytics/Brand Mgmt: ₹1,40,250 | BBA Hons Intl Finance & Data Analytics: ₹3,00,000 | BBA Aviation: ₹2,00,000 | MBA HR/Finance/Ops/Marketing: ₹3,50,000 | MBA Business Analytics/Retail Mgmt: ₹2,38,000 | MBA Sports/AI & Data Science/Intl Business: ₹10,00,000 | MBA Aviation: ₹3,00,000',
  SOD: 'SOD (Design): BDes UI/UX, Visual Comm, Fashion: ₹3,50,000 | BDes Transportation Design: ₹5,00,000 | MDes Transportation Design: ₹7,00,000 | MDes UI/UX: ₹5,00,000 | PG Diploma Digital Modelling: ₹2,75,000',
  SOL: 'SOL (Law): BA LLB / LLB / LLM: ₹2,00,000/year',
  SOLA: 'SOLA (Liberal Arts): BA Hons / MA International Studies: ₹2,30,000/year',
  SOA: 'SOA (Architecture): BArch / MArch: ₹2,00,000/year',
  SOHM: 'SOHM (Hotel Management): BSc HHA: ₹1,75,000 | MSc: ₹2,00,000/year',
  SOFM: 'SOFM (Film & Media): BSc Sound Engg: ₹3,00,000 | Film Making: ₹2,00,000 | Animation/Journalism: ₹1,55,000/year',
  PHD: 'PhD (all disciplines): ₹2,00,000/year'
};

const UG_BY_SCHOOL = {
  SOE: 'SOE undergraduate options: BTech specializations in CSE (AI, Cyber Security, Software Engineering, Fintech, VR & AR, Cyber Forensic & Info Security), IT (Mobile App & Info Security, Cloud Tech, AI & Digital Systems), Biotech (Medical Biotech, Food Tech, Bioinformatics), Mechanical (Automobile, 3D Printing & Design), AI & Data Science, Biomedical Engineering, Robotics, Civil, Aeronautical, Aerospace, Avionics, Smart Energy, Electronics & Computer Engineering, and BCA (Hons) tracks including AI & Data Science, Blockchain, Full Stack Dev, Game Dev, IoT, Web App Dev, Cyber Security, and Data Analytics.',
  SOM: 'SOM undergraduate options: BBA tracks in Entrepreneurship, International Business, Business Analytics, Finance, Fintech, Digital Banking, Marketing, Brand Management, Logistics, Aviation, Sports Management, Decision Sciences, plus BBA Hons, BBA International Finance, and iB.Com (International Accounting).',
  SOD: 'SOD undergraduate options: BDes in UI/UX, Visual Communication, Product Design, Transportation Design, Fashion Design, and Interior Design.',
  SOL: 'SOL undergraduate options: BA LLB (5-year), BBA LLB (5-year), and LLB (3-year).',
  SOHM: 'SOHM undergraduate options: BSc HHA specializations in Culinary Arts, Hotel Management, and Travel & Tourism.',
  SOLA: 'SOLA undergraduate options: BA majors in English, International Studies, Psychology, and Economics, with specializations in English Literature, Economics, Psychology, Politics & International Relations, Journalism & Mass Communication, and Sociology.',
  SOFM: 'SOFM undergraduate options: BSc (Hons) Film & Media in Sound Engineering, Film Making, Animation & VFX, Game Art & Design, plus BA (Hons) Journalism & Media Production.',
  SOA: 'SOA undergraduate option: BArch (5-year).'
};

const PG_BY_SCHOOL = {
  SOE: 'SOE postgraduate options: MTech in Bio-Engineering, Robotics & Automation, AI & ML, Space Technology, Infrastructure Engineering, Renewable Engineering, plus MCA.',
  SOM: 'SOM postgraduate options: MBA in HR, Marketing, Finance, Digital Marketing & E-Commerce, Business Analytics & Data Science, Supply Chain & Logistics, International Business, Aviation Management, and Sports Management.',
  SOD: 'SOD postgraduate options: MDes in UX Design, Transportation Design, Product Design, and Fashion Design.',
  SOL: 'SOL postgraduate options: LLM in Corporate & Commercial Law, Constitutional & Administrative Law, Criminal & Security Law, and IP Law.',
  SOFM: 'SOFM postgraduate options: MSc Film & Media in Film Making/Direction, Media Management, Animation & VFX, plus MA programs.',
  SOLA: 'SOLA postgraduate options: MA in Psychology, Economics, English, and International Relations.',
  SOHM: 'SOHM postgraduate option: MSc in Hospitality & Tourism Management.',
  SOA: 'SOA postgraduate option: MArch in Sustainable Architecture / Environmental Design.'
};

const UG_OVERVIEW =
  'Undergraduate courses at ADYPU are available across SOE, SOM, SOD, SOL, SOHM, SOLA, SOFM, and SOA. Examples include BTech, BCA, BBA, BDes, BA LLB, BBA LLB, LLB, BSc HHA, BA Liberal Arts, BSc Film & Media, BA Journalism & Media Production, and BArch. Tell me the school name if you want the exact specializations.';

const PG_OVERVIEW =
  'Postgraduate courses at ADYPU are available across SOE, SOM, SOD, SOL, SOFM, SOLA, SOHM, and SOA. Examples include MTech, MCA, MBA, MDes, LLM, MSc Film & Media, MA, MSc Hospitality & Tourism Management, and MArch. Tell me the school name if you want the exact specializations.';

const CONTACTS_BY_SCHOOL = {
  GENERAL: 'General Admissions: +91-8956487911 / +91-8956487916',
  SOE: 'SOE: +91-8956487911 / +91-9175067360',
  SOM: 'SOM: +91-9075153542 / +91-8956487916',
  SOD: 'SOD: +91-9075153542 / +91-8956487916',
  SOL: 'SOL: +91-9175069861 / +91-9028954966',
  SOHM: 'SOHM: +91-7906285013',
  HOSTEL: 'Hostel: +91-8087778799'
};

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s#@.+/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asksForLink(message) {
  return /\blink\b|\burl\b|\bwebsite\b|\bpage\b|\bpdf\b/.test(normalize(message));
}

function asksForFullForm(message) {
  return /\bfull form\b|\bstand for\b|\bmeaning\b|\bwhat is\b/.test(normalize(message));
}

function detectSchool(message) {
  const text = normalize(message);
  if (/(engineering|soe|btech|mtech|cse|cyber|mechanical|biotech|biomedical|robotics|aerospace|aeronautical|avionics|civil|smart energy|electronics|electrical|computer engineering|ai data science|artificial intelligence|bca|mca)/.test(text)) return 'SOE';
  if (/(management|som|bba|mba|marketing|finance|aviation|business analytics|brand|entrepreneurship|international business|fintech|logistics|decision sciences)/.test(text)) return 'SOM';
  if (/(design|sod|bdes|mdes|ui ux|visual communication|fashion|transportation|product design|interior design|digital modelling)/.test(text)) return 'SOD';
  if (/(law|sol|llb|llm)/.test(text)) return 'SOL';
  if (/(liberal arts|sola|international studies|psychology|economics|english|sociology|journalism and mass communication|politics and international relations)/.test(text)) return 'SOLA';
  if (/(architecture|soa|barch|march)/.test(text)) return 'SOA';
  if (/(hotel|hospitality|sohm|bsc hha|msc hospitality|tourism|culinary)/.test(text)) return 'SOHM';
  if (/(film|media|sofm|sound engg|sound engineering|film making|animation|vfx|game art|journalism media production)/.test(text)) return 'SOFM';
  if (/(phd|doctoral|pet|research)/.test(text)) return 'PHD';
  return null;
}

function detectSchoolFromPromptLabel(message) {
  const text = normalize(message);
  if (/(dean name|law and liberal arts dean|ssd dean|registrar|vice chancellor|official)/.test(text)) return 'OFFICIALS';
  if (/(admissions link|admission process|mandatory disclosures)/.test(text)) return 'ADMISSIONS';
  if (/(hostel fee|fees pdf|hostel contact)/.test(text)) return 'FEES';
  if (/(who handles placements|spcr full form|placements page link)/.test(text)) return 'PLACEMENTS';
  if (/(ssd full form|sod full form|ssd vs sod)/.test(text)) return 'SHORTFORMS';
  return null;
}

function detectEvent(message) {
  const text = normalize(message);
  if (text.includes('#tech') || text.includes('tech fest')) return '#TECH';
  if (text.includes('alchemy')) return 'Alchemy';
  if (text.includes('impetus')) return 'Impetus';
  if (text.includes('ablaze')) return 'Ablaze';
  if (text.includes('chatori galli')) return 'Chatori Galli';
  if (text.includes('moot court')) return 'National Moot Court';
  return null;
}

function detectParticipantType(message) {
  const text = normalize(message);
  if (/(current|existing|student|erp)/.test(text)) return 'current';
  if (/(external|outside|visitor|guest|participant)/.test(text)) return 'external';
  return null;
}

function isRegisterQuery(message) {
  return /\bregister\b|\bregistration\b|\bjoin\b/.test(normalize(message));
}

function isNegative(message) {
  return /(not helpful|useless|wrong info|frustrated|urgent|emergency|ragging|harassment|confused)/.test(normalize(message));
}

function admissionsProcessForSchool(school) {
  const base = [
    'Admissions process:',
    '1. Register and appear for ACET (ADYPU Common Entrance Test)',
    '2. Counseling session',
    '3. Personal interview',
    '4. Document verification and fee payment'
  ];
  if (school === 'SOD') {
    base.push('Design also requires Studio Test and portfolio/SOP review.');
  }
  return `${base.join('\n')}\n${DOCUMENTS_BLOCK}\n${ADMISSIONS_CONTACT_BLOCK}`;
}

function formatEventInfo(eventName) {
  const data = {
    '#TECH': 'Annual tech + sports + culture festival (March/April) with hackathons, workshops, and competitions.',
    Alchemy: 'SOD flagship creative showcase held in April.',
    Impetus: 'Annual sports meet across disciplines, usually in February/March.',
    Ablaze: 'Cultural fest in late March with dance, music, poetry, stand-up comedy, and fashion show.',
    'Chatori Galli': 'Food and cultural extravaganza.',
    'National Moot Court': 'Legal competition by SOL with teams from across India.'
  };
  return data[eventName] || null;
}

export async function handleSaathiMessage({ intentId, message, state = {}, unknownIntentCount = 0 }) {
  const flow = state?.flow && typeof state.flow === 'object' ? state.flow : null;

  if (flow?.id === 'INT-03' && flow.step === 'ask_school') {
    const school = detectSchool(message);
    if (!school || !FEES_BY_SCHOOL[school]) {
      return {
        handled: true,
        textEn: 'Please tell me which school you want the fees for: SOE, SOM, SOD, SOL, SOLA, SOA, SOHM, SOFM, or PhD.',
        newState: { ...state, flow }
      };
    }
    return {
      handled: true,
      textEn: `${FEES_BY_SCHOOL[school]}\n${FEE_PAYMENT_BLOCK}\nWould you also like admissions or scholarship details?`,
      newState: { ...state, flow: null }
    };
  }

  if (flow?.id === 'INT-09' && flow.step === 'ask_event') {
    const eventName = detectEvent(message);
    if (!eventName) {
      return {
        handled: true,
        textEn: 'Which event are you asking about: #TECH, Alchemy, Impetus, Ablaze, Chatori Galli, or National Moot Court?',
        newState: { ...state, flow }
      };
    }

    if (isRegisterQuery(message)) {
      return {
        handled: true,
        textEn: `${formatEventInfo(eventName)}\nAre you a current student or an external participant?`,
        newState: { ...state, flow: { id: 'INT-09', step: 'ask_participant_type', eventName } }
      };
    }

    return {
      handled: true,
      textEn: `${formatEventInfo(eventName)}\nRegistration: Current students use the ERP Portal or Student Council heads. External participants use adypu.edu.in/events. Instagram tip: follow @adypu for QR codes first. Registration desks are near the cafeteria/auditorium from 12:30-1:30 PM.`,
      newState: { ...state, flow: null }
    };
  }

  if (flow?.id === 'INT-09' && flow.step === 'ask_participant_type') {
    const type = detectParticipantType(message);
    if (!type) {
      return {
        handled: true,
        textEn: 'Are you a current student or an external participant?',
        newState: { ...state, flow }
      };
    }

    const path =
      type === 'current'
        ? 'Current students should register through the ERP Portal or Student Council heads.'
        : 'External participants should register at adypu.edu.in/events.';

    return {
      handled: true,
      textEn: `${formatEventInfo(flow.eventName)}\n${path}\nInstagram tip: follow @adypu for QR codes first. Registration desks are near the cafeteria/auditorium from 12:30-1:30 PM.`,
      newState: { ...state, flow: null }
    };
  }

  if (intentId === 'INT-02') {
    if (asksForLink(message) && /mandatory disclosures/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Mandatory disclosures: https://adypu.edu.in/admissions/mandatory-disclosures',
        newState: { ...state, flow: null }
      };
    }

    if (asksForLink(message) && /admission/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Admissions page: https://adypu.edu.in/admissions/',
        newState: { ...state, flow: null }
      };
    }

    const school = detectSchool(message);
    if (!school || school === 'PHD') {
      return {
        handled: true,
        textEn: `Which school are you applying to: SOE, SOM, SOD, SOL, SOLA, SOA, SOHM, or SOFM?`,
        newState: { ...state, flow: null }
      };
    }

    const courseInfo = UG_BY_SCHOOL[school] || PG_BY_SCHOOL[school] || '';
    return {
      handled: true,
      textEn: `${courseInfo}\n${admissionsProcessForSchool(school)}\nIf you want, I can also share the fee details for this school.`,
      newState: { ...state, flow: null }
    };
  }

  if (intentId === 'INT-03') {
    if (asksForLink(message) && /fees pdf|2025 26|2025-26/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Fees PDF (2025-26): https://adypu.edu.in/wp-content/uploads/2025/06/188.Fees-Structure_ADYPU_All-Programs_2025-26.pdf',
        newState: { ...state, flow: null }
      };
    }

    if (/hostel/.test(normalize(message)) && /fee|range/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Hostel fee guidance range: Rs 90,000 to Rs 1,80,000 per year (excluding mess charges).',
        newState: { ...state, flow: null }
      };
    }

    const school = detectSchool(message);
    if (!school || !FEES_BY_SCHOOL[school]) {
      return {
        handled: true,
        textEn: 'Which school would you like the fee structure for: SOE, SOM, SOD, SOL, SOLA, SOA, SOHM, SOFM, or PhD?',
        newState: { ...state, flow: { id: 'INT-03', step: 'ask_school' } }
      };
    }

    return {
      handled: true,
      textEn: `${FEES_BY_SCHOOL[school]}\n${FEE_PAYMENT_BLOCK}`,
      newState: { ...state, flow: null }
    };
  }

  if (intentId === 'INT-04') {
    const school = detectSchool(message);
    if (!school && /(\bcourse\b|\bcourses\b|\bprogram\b|\bprogramme\b|\bdegree\b|\bdegrees\b|\bmajor\b|\bmajors\b|\bspeciali)/.test(normalize(message))) {
      return {
        handled: true,
        textEn: UG_OVERVIEW,
        newState: { ...state, flow: null }
      };
    }

    if (!school || !UG_BY_SCHOOL[school]) {
      return {
        handled: true,
        textEn: 'Which school are you asking about for undergraduate courses: SOE, SOM, SOD, SOL, SOHM, SOLA, SOFM, or SOA?',
        newState: { ...state, flow: null }
      };
    }

    return { handled: true, textEn: UG_BY_SCHOOL[school], newState: state };
  }

  if (intentId === 'INT-05') {
    const school = detectSchool(message);
    if (!school && /(\bpg\b|\bpostgraduate\b|\bmasters\b|\bmaster'?s\b)/.test(normalize(message))) {
      return {
        handled: true,
        textEn: PG_OVERVIEW,
        newState: { ...state, flow: null }
      };
    }

    if (!school || !PG_BY_SCHOOL[school]) {
      return {
        handled: true,
        textEn: 'Which school are you asking about for postgraduate courses: SOE, SOM, SOD, SOL, SOFM, SOLA, SOHM, or SOA?',
        newState: { ...state, flow: null }
      };
    }

    return { handled: true, textEn: PG_BY_SCHOOL[school], newState: state };
  }

  if (intentId === 'INT-06') {
    return {
      handled: true,
      textEn:
        'Scholarships available include: Ajeenkya Genius Scholarship, Pune Pride Scholarship, ADYPU Divyang Excellence Scholarship, Beti Padhao Scholarship, Khelo India Sports Delight Scholarship, ADYPU Entrance Talent Hunt Scholarship, and Innovation & Excellence Based Scholarships.\nContact: admissions@adypu.edu.in | +91-8956487911',
      newState: state
    };
  }

  if (intentId === 'INT-07') {
    if (asksForFullForm(message) && /\bssd\b/.test(normalize(message))) {
      return { handled: true, textEn: 'SSD stands for Student Service Division.', newState: state };
    }

    if (asksForFullForm(message) && /\bsod\b/.test(normalize(message))) {
      return { handled: true, textEn: 'SoD stands for School of Design.', newState: state };
    }

    if (asksForFullForm(message) && /\bspcr\b/.test(normalize(message))) {
      return { handled: true, textEn: 'SPCR stands for Students Progression and Corporate Relations.', newState: state };
    }

    if (/ssd/.test(normalize(message)) && /sod/.test(normalize(message)) && /difference|vs/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'SSD is the Student Service Division. SoD is the School of Design. They are different units.',
        newState: state
      };
    }

    const school = detectSchool(message);
    const specific = school && CONTACTS_BY_SCHOOL[school] ? `${CONTACTS_BY_SCHOOL[school]}\n` : '';
    return {
      handled: true,
      textEn:
        `${specific}${CONTACTS_BY_SCHOOL.GENERAL}\n${CONTACTS_BY_SCHOOL.HOSTEL}\nEmails: admissions@adypu.edu.in | info@adypu.edu.in | ssd@adypu.edu.in | soe.info@adypu.edu.in\nStudent Council: info.studencouncil@adypu.edu.in`,
      newState: state
    };
  }

  if (intentId === 'INT-08') {
    return {
      handled: true,
      textEn:
        'Campus facilities include: main auditorium, amphitheater, cafeteria, landscape gardens, outdoor sports centre, indoor sports arena, smart classrooms, IT centre, open study spaces, health centre, biodiversity park, and on-campus hostel.\nSports: Cricket, Football, Basketball, Volleyball, Badminton, Chess, Athletics | Head: Dr. Heena Sidhu\nHostel contact: +91-8087778799 | Hostel Reps: Ms. Ishita Thulkar, Mr. Bhavya Daga',
      newState: state
    };
  }

  if (intentId === 'INT-09') {
    const eventName = detectEvent(message);
    if (!eventName) {
      return {
        handled: true,
        textEn: 'Which event are you asking about: #TECH, Alchemy, Impetus, Ablaze, Chatori Galli, or National Moot Court?',
        newState: { ...state, flow: { id: 'INT-09', step: 'ask_event' } }
      };
    }

    if (isRegisterQuery(message)) {
      return {
        handled: true,
        textEn: `${formatEventInfo(eventName)}\nAre you a current student or an external participant?`,
        newState: { ...state, flow: { id: 'INT-09', step: 'ask_participant_type', eventName } }
      };
    }

    return {
      handled: true,
      textEn: `${formatEventInfo(eventName)}\nRegistration: Current students use the ERP Portal or Student Council heads. External participants use adypu.edu.in/events. Instagram tip: follow @adypu for QR codes first. Registration desks are near the cafeteria/auditorium from 12:30-1:30 PM.`,
      newState: state
    };
  }

  if (intentId === 'INT-10') {
    return {
      handled: true,
      textEn:
        'Clubs include Technical: Coding Club, Robotics Club, AI & Data Science Club. Creative: Dramatics Club, Dance Club, Music Club, Photography & Film Club. Media & Literary: Editorial Board, Debate & Literary Society. Sports & Adventure: Adventure Club, Cricket/Football/Basketball teams. Social: NSS.\nHow to join: Club Fair at the start of the year in the amphitheater | SSD office | QR codes on campus boards/ERP\nNSS Director: Shital Dilip Solanki | Contact: ssd@adypu.edu.in',
      newState: state
    };
  }

  if (intentId === 'INT-11') {
    return {
      handled: true,
      textEn:
        'Student Council Instagram: @adypu.studentcouncil | Email: info.studencouncil@adypu.edu.in\nPresident: Mr. Devesh Dinesh Pandey\nPresident/Rotaract Head: Mr. Yash Yogesh Somani\nVice Presidents: Ms. Ritul Dhanwade, Ms. Rajshree Sahay, Ms. Piyul Tejaswini Khare\nSecretaries: Ms. Akansha Nair, Mr. Pratham Sharma, Mr. Atharva Gutte\nEligibility: Min. CGPA 7.0+, clean disciplinary record, campus campaign + student vote + faculty interview. Investiture Ceremony: August/September.',
      newState: state
    };
  }

  if (intentId === 'INT-12') {
    if (/vice chancellor/.test(normalize(message))) {
      return { handled: true, textEn: 'Vice Chancellor: Dr. Rakesh Kumar Jain', newState: state };
    }

    if (/registrar/.test(normalize(message)) && /email|mail/.test(normalize(message))) {
      return { handled: true, textEn: 'Registrar email: registrar@adypu.edu.in', newState: state };
    }

    if (/registrar/.test(normalize(message))) {
      return { handled: true, textEn: 'Registrar: Dr. Sudhakar Shinde', newState: state };
    }

    if (/(sod|school of design)/.test(normalize(message)) && /dean/.test(normalize(message))) {
      return { handled: true, textEn: 'SoD Dean: Ar. Aparna Mhetras', newState: state };
    }

    if (/ssd/.test(normalize(message)) && /dean/.test(normalize(message))) {
      return { handled: true, textEn: 'SSD Dean: Dr. Vijay Kulkarni', newState: state };
    }

    if (/(law|liberal arts)/.test(normalize(message)) && /dean/.test(normalize(message))) {
      return { handled: true, textEn: 'Law and Liberal Arts Dean: Dr. Sunny Thomas', newState: state };
    }

    return {
      handled: true,
      textEn:
        'Governing Body:\nChancellor/President: Dr. Ajeenkya D Y Patil\nVice Chancellor: Dr. Rakesh Kumar Jain\nRegistrar: Dr. Sudhakar Shinde\nController of Examinations: Dr. Sunil Ingole\nDeans: SOE & Defence - Dr. Prashant Kumbharkar | SOM - Dr. Chetna Mehta | SOD - Ar. Aparna Mhetras | SOL & SOLA - Dr. Sunny Thomas | Science & SOFM - Dr. Sushanta Das | SOHM (Assoc. Dean) - Dr. Atul Ramgade | SOA - Prof. Rajaram Golgire | Doctoral Studies - Dr. Radhika Menon | SSD - Dr. Vijay Kulkarni',
      newState: state
    };
  }

  if (intentId === 'INT-13') {
    return {
      handled: true,
      textEn:
        'PhD fee: ₹2,00,000/year | Duration: 3-6 years (minimum 3 including coursework)\nPET Structure: Paper I Research Methodology (50%) + Paper II Subject-specific (50%)\nInterview: Present a 500-1000 word research proposal\nWritten PET exemption: NET/SET/GATE qualified or MPhil holders, but interview is still required\nApply: adypu.edu.in/doctoral-program | admissions@adypu.edu.in',
      newState: state
    };
  }

  if (intentId === 'INT-14') {
    return {
      handled: true,
      textEn:
        'Ajeenkya DY Patil University (ADYPU) is an innovation-focused private university in Pune, Maharashtra, India, offering 100+ undergraduate, postgraduate, and doctoral programs.\nKey features: T-Shaped Professional curriculum, global partnerships in the US, UK, and Europe, DRIF, EIC, and 9+ schools.\nRecent highlights (2025-26): SOM ranked in Times B-School Survey 2026, 10th Convocation on December 22, 2025, IEEE International Conference hosted on campus, Young Innovator Business Idea Competition launched, and PhD Admissions Open 2026.',
      newState: state
    };
  }

  if (intentId === 'INT-15') {
    if (asksForLink(message) && /placement/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Placements page: https://adypu.edu.in/placements/',
        newState: state
      };
    }

    if (/who handles placements/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Placements and Corporate Relations leaders: Dr. Santosh P. Rao Borde and Dr. Tushar Ram Sangole.',
        newState: state
      };
    }

    return {
      handled: true,
      textEn:
        'Placements: SOM highest package ₹9 LPA | average package ₹5.5 LPA.\nPlacement Heads (Student Council): Mr. Varad Vijay Khopkar, Ms. Durva Mitesh Patil, Mr. Om Jeughale.\nFocus: industry-ready curriculum, internship integration, portfolio development, and corporate networks.',
      newState: state
    };
  }

  if (intentId === 'INT-16') {
    if (/ragging|harassment/.test(normalize(message))) {
      return {
        handled: true,
        textEn:
          'I am really sorry to hear this. ADYPU has zero tolerance for ragging. Report immediately to ssd@adypu.edu.in | Dean SSD: Dr. Vijay Kulkarni. All reports are confidential.',
        newState: state
      };
    }

    if (/emergency|medical|urgent/.test(normalize(message))) {
      return {
        handled: true,
        textEn:
          'I am really sorry you are dealing with this. Please visit the campus health centre immediately. For life-threatening emergencies, call 112. SSD: ssd@adypu.edu.in',
        newState: state
      };
    }

    if (/wrong info/.test(normalize(message))) {
      return {
        handled: true,
        textEn: 'Thank you for flagging this. For verified information, please contact info@adypu.edu.in or call +91-8956487911.',
        newState: state
      };
    }

    if (/confused|lost/.test(normalize(message))) {
      return {
        handled: true,
        textEn: `I am sorry for the confusion. Please choose one option:\n1. Admissions\n2. Fees\n3. Courses\n4. Campus\n5. Events\n6. Clubs\n7. Council\n8. Contacts`,
        newState: state
      };
    }

    if (isNegative(message)) {
      return {
        handled: true,
        textEn: SAATHI_HUMAN_ESCALATION_EN,
        newState: state
      };
    }
  }

  if (intentId === 'INT-17') {
    return {
      handled: true,
      textEn: `${SAATHI_REPHRASE_EN}\n\n${SAATHI_MENU_EN}`,
      newState: state,
      unknownIntentCount: Math.min(99, Number(unknownIntentCount || 0) + 1)
    };
  }

  if (intentId === 'INT-18') {
    const nextCount = Math.min(99, Number(unknownIntentCount || 0) + 1);
    return {
      handled: true,
      textEn: nextCount >= 2 ? SAATHI_OUT_OF_SCOPE_EN : `${SAATHI_REPHRASE_EN}\n\n${SAATHI_MENU_EN}`,
      newState: { ...state, flow: null },
      unknownIntentCount: nextCount
    };
  }

  return { handled: false };
}
