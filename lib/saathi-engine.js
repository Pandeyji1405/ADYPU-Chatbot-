import { findKbByTitle } from './adypu-kb.js';
import { SAATHI_HUMAN_ESCALATION_EN, SAATHI_MENU_EN, SAATHI_OUT_OF_SCOPE_EN, SAATHI_REPHRASE_EN } from './saathi.js';

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s#@.+-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 2);
}

function sentenceBestMatch(content, query) {
  const sentences = String(content || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return '';

  const qTokens = new Set(tokenize(query));
  let best = { score: 0, sentence: sentences[0] };

  for (const sentence of sentences) {
    const sTokens = tokenize(sentence);
    let overlap = 0;
    for (const token of sTokens) if (qTokens.has(token)) overlap += 1;
    const score = overlap / Math.max(1, qTokens.size);
    if (score > best.score) best = { score, sentence };
  }

  return best.score >= 0.12 ? best.sentence : sentences[0];
}

function detectSchoolForFees(message) {
  const t = normalize(message);
  if (/(b\.?\s*tech|engineering|soe|cse|mechanical|biotech|robotics|aero|avionics|ai and data|data science|cyber)/.test(t)) return 'SOE';
  if (/(mba|bba|management|som|fintech|aviation|marketing|finance|hr|operations)/.test(t)) return 'SOM';
  if (/(design|b\.?\s*des|m\.?\s*des|sod|ui\/ux|fashion|transportation)/.test(t)) return 'SOD';
  if (/(law|llb|llm|liberal|architecture|hotel|film|media|ph\.?d|doctoral)/.test(t)) return 'OTHER';
  return null;
}

function detectApplicantType(message) {
  const t = normalize(message);
  if (/(new|apply|applicant|fresh|admission|ac[e]?t)/.test(t)) return 'new';
  if (/(existing|current|already|student|erp)/.test(t)) return 'existing';
  return null;
}

async function kbSourcesForTitles(titles) {
  const sources = [];
  for (const title of titles) {
    const item = await findKbByTitle(title);
    if (!item) continue;
    sources.push({ title: item.title, source: item.source, score: 0.95 });
  }
  return sources;
}

export async function handleSaathiMessage({ intentId, message, state = {}, unknownIntentCount = 0 }) {
  const flow = state?.flow && typeof state.flow === 'object' ? state.flow : null;

  // Continue multi-turn flow first
  if (flow?.id === 'INT-01' && flow.step === 'ask_program') {
    const school = detectSchoolForFees(message);
    if (!school) {
      return {
        handled: true,
        textEn: 'Which program/school are you asking about? For example: School of Engineering (B.Tech), School of Management (BBA/MBA), or School of Design (B.Des/M.Des).',
        newState: { ...state, flow: { id: 'INT-01', step: 'ask_program' } }
      };
    }
    return handleFeeIntent(message, { ...state, flow: null }, { forceSchool: school });
  }

  if (flow?.id === 'INT-03' && flow.step === 'ask_applicant_type') {
    const type = detectApplicantType(message);
    if (!type) {
      return {
        handled: true,
        textEn: 'Are you a new applicant or an existing student?',
        newState: { ...state, flow: { id: 'INT-03', step: 'ask_applicant_type' } }
      };
    }
    return handleAdmissionIntent(message, { ...state, flow: null }, { forceType: type });
  }

  if (flow?.id === 'INT-13' && flow.step === 'ask_details') {
    const details = String(message || '').trim();
    if (!details) {
      return {
        handled: true,
        textEn: 'What item was lost? When and where approximately?',
        newState: { ...state, flow: { id: 'INT-13', step: 'ask_details' } }
      };
    }
    return {
      handled: true,
      textEn: `Your report has been logged. Please also visit the SSD Office or email ssd@adypu.edu.in with the details.\n\n(For privacy, please do not share ID numbers or phone numbers in chat.)`,
      newState: { ...state, flow: null, lastLostFound: { ts: new Date().toISOString(), details: details.slice(0, 500) } },
      sources: await kbSourcesForTitles(['SSD Quick Facts'])
    };
  }

  // Single-turn scripted intents
  if (intentId === 'INT-12') {
    const sources = await kbSourcesForTitles(['Admissions Contact Directory', 'SSD Quick Facts']);
    return {
      handled: true,
      textEn: `I'm connecting you to emergency support.\n- SSD Office: ssd@adypu.edu.in\n- General Admissions: +91-8956487911`,
      newState: state,
      sources
    };
  }

  if (intentId === 'INT-01') {
    const school = detectSchoolForFees(message);
    if (!school) {
      return {
        handled: true,
        textEn: 'Which program/school are you enrolled in or asking about?',
        newState: { ...state, flow: { id: 'INT-01', step: 'ask_program' } }
      };
    }
    return handleFeeIntent(message, { ...state, flow: null }, { forceSchool: school });
  }

  if (intentId === 'INT-03') {
    const type = detectApplicantType(message);
    if (!type) {
      return {
        handled: true,
        textEn: 'Are you a new applicant or an existing student?',
        newState: { ...state, flow: { id: 'INT-03', step: 'ask_applicant_type' } }
      };
    }
    return handleAdmissionIntent(message, { ...state, flow: null }, { forceType: type });
  }

  if (intentId === 'INT-13') {
    return {
      handled: true,
      textEn: 'What item was lost? When and where approximately?',
      newState: { ...state, flow: { id: 'INT-13', step: 'ask_details' } }
    };
  }

  if (intentId === 'INT-04') {
    const scholarships = await findKbByTitle('Scholarships');
    const admissions = await findKbByTitle('SOE Admissions');
    const parts = [];
    if (scholarships?.content) parts.push(scholarships.content);
    if (admissions?.content && !parts.includes(admissions.content)) parts.push('Scholarship process: Complete ACET → Counseling Session → Personal Interview.');
    return {
      handled: true,
      textEn: parts.join('\n'),
      newState: state,
      sources: [
        scholarships ? { title: scholarships.title, source: scholarships.source, score: 0.95 } : null,
        admissions ? { title: admissions.title, source: admissions.source, score: 0.8 } : null
      ].filter(Boolean)
    };
  }

  if (intentId === 'INT-08') {
    const phones = await findKbByTitle('Admissions Contact Directory');
    const emails = await findKbByTitle('Email Directory');
    const hours = await findKbByTitle('Office Hours');
    const textEn = [phones?.content, emails?.content, hours?.content].filter(Boolean).join('\n');
    return {
      handled: true,
      textEn: textEn || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: [
        phones ? { title: phones.title, source: phones.source, score: 0.95 } : null,
        emails ? { title: emails.title, source: emails.source, score: 0.95 } : null,
        hours ? { title: hours.title, source: hours.source, score: 0.95 } : null
      ].filter(Boolean)
    };
  }

  if (intentId === 'INT-10') {
    const overview = await findKbByTitle('Student Council Overview');
    const bearers = await findKbByTitle('Student Council Office Bearers');
    const eligibility = await findKbByTitle('Student Council Eligibility & Selection');
    const fallback = await findKbByTitle('Devesh Pandey - Student Council President');

    const textEn = [overview?.content, bearers?.content, eligibility?.content, fallback?.content].filter(Boolean).join('\n');
    return {
      handled: true,
      textEn: textEn || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: [
        overview ? { title: overview.title, source: overview.source, score: 0.95 } : null,
        bearers ? { title: bearers.title, source: bearers.source, score: 0.95 } : null,
        eligibility ? { title: eligibility.title, source: eligibility.source, score: 0.95 } : null,
        fallback ? { title: fallback.title, source: fallback.source, score: 0.8 } : null
      ].filter(Boolean)
    };
  }

  if (intentId === 'INT-07') {
    const hostel = await findKbByTitle('Hostel Contact and Fees');
    return {
      handled: true,
      textEn: hostel?.content || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: hostel ? [{ title: hostel.title, source: hostel.source, score: 0.95 }] : []
    };
  }

  if (intentId === 'INT-09') {
    const events = await findKbByTitle('Campus Events');
    const clubs = await findKbByTitle('How to Join Clubs');
    const textEn = [events?.content, clubs?.content].filter(Boolean).join('\n');
    return {
      handled: true,
      textEn: textEn || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: [
        events ? { title: events.title, source: events.source, score: 0.95 } : null,
        clubs ? { title: clubs.title, source: clubs.source, score: 0.95 } : null
      ].filter(Boolean)
    };
  }

  if (intentId === 'INT-11') {
    const placements = await findKbByTitle('SOM Placements and Admissions');
    const quickFacts = await findKbByTitle('Placement Quick Facts');
    const textEn = [placements?.content, quickFacts?.content].filter(Boolean).join('\n');
    return {
      handled: true,
      textEn: textEn || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: [
        placements ? { title: placements.title, source: placements.source, score: 0.9 } : null,
        quickFacts ? { title: quickFacts.title, source: quickFacts.source, score: 0.95 } : null
      ].filter(Boolean)
    };
  }

  if (intentId === 'INT-14') {
    const nss = await findKbByTitle('NSS (National Service Scheme)');
    return {
      handled: true,
      textEn: nss?.content || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: nss ? [{ title: nss.title, source: nss.source, score: 0.95 }] : []
    };
  }

  if (intentId === 'INT-15') {
    const phd = await findKbByTitle('Ph.D. / Doctoral Programs Details');
    return {
      handled: true,
      textEn: phd?.content || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: phd ? [{ title: phd.title, source: phd.source, score: 0.95 }] : []
    };
  }

  if (intentId === 'INT-05' || intentId === 'INT-06') {
    return {
      handled: true,
      textEn: SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: []
    };
  }

  if (intentId === 'INT-16') {
    const officials = await findKbByTitle('University Officials and Deans');
    const board = await findKbByTitle('Governing Board');
    const textEn = [officials?.content, board?.content].filter(Boolean).join('\n');
    return {
      handled: true,
      textEn: textEn || SAATHI_OUT_OF_SCOPE_EN,
      newState: state,
      sources: [
        officials ? { title: officials.title, source: officials.source, score: 0.95 } : null,
        board ? { title: board.title, source: board.source, score: 0.95 } : null
      ].filter(Boolean)
    };
  }

  // Unknown / ambiguous intent fallback
  if (intentId === 'INT-18') {
    const nextCount = Math.min(99, Number(unknownIntentCount || 0) + 1);
    if (nextCount >= 2) {
      return {
        handled: true,
        textEn: `${SAATHI_HUMAN_ESCALATION_EN}`,
        newState: { ...state, flow: null },
        unknownIntentCount: nextCount
      };
    }

    return {
      handled: true,
      textEn: `${SAATHI_REPHRASE_EN}\n\n${SAATHI_MENU_EN}`,
      newState: { ...state, flow: null },
      unknownIntentCount: nextCount
    };
  }

  // Not handled here: let RAG answer from KB.
  return { handled: false };
}

async function handleFeeIntent(message, state, options = {}) {
  const school = options.forceSchool;
  const overview = await findKbByTitle('Fee Structure Overview (2024-25)');

  const title =
    school === 'SOE'
      ? 'SOE Fee Structure (2024-25)'
      : school === 'SOM'
        ? 'SOM Fee Structure (2024-25)'
        : school === 'SOD'
          ? 'SOD Fee Structure (2024-25)'
          : 'Other Schools Fee Structure (2024-25)';

  const fees = await findKbByTitle(title);
  const line = fees?.content ? sentenceBestMatch(fees.content, message) : '';

  const parts = [];
  if (line) parts.push(line);
  if (overview?.content) parts.push(overview.content);
  parts.push('Would you like the contact for Admissions?');

  return {
    handled: true,
    textEn: parts.filter(Boolean).join('\n'),
    newState: state,
    sources: [
      fees ? { title: fees.title, source: fees.source, score: 0.95 } : null,
      overview ? { title: overview.title, source: overview.source, score: 0.9 } : null
    ].filter(Boolean)
  };
}

async function handleAdmissionIntent(message, state, options = {}) {
  const type = options.forceType;
  const admissions = await findKbByTitle('SOE Admissions');
  const contacts = await findKbByTitle('Admissions Contact Directory');

  if (type === 'existing') {
    return {
      handled: true,
      textEn: `For existing students, please use the ERP portal for academic actions, or contact your school office.\n\nAdmissions help:\n${contacts?.content || 'General Admissions: +91-8956487911 / +91-8956487916'}`,
      newState: state,
      sources: [contacts ? { title: contacts.title, source: contacts.source, score: 0.95 } : null].filter(Boolean)
    };
  }

  const steps = admissions?.content
    ? admissions.content
    : 'Undergraduate admission process: Register for ADYPU Common Entrance Test (ACET) → Counseling Session → Personal Interview.';

  return {
    handled: true,
    textEn: `${steps}\n\nAdmissions help:\n${contacts?.content || 'General Admissions: +91-8956487911 / +91-8956487916'}`,
    newState: state,
    sources: [
      admissions ? { title: admissions.title, source: admissions.source, score: 0.9 } : null,
      contacts ? { title: contacts.title, source: contacts.source, score: 0.95 } : null
    ].filter(Boolean)
  };
}
