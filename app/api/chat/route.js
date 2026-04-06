import { NextResponse } from 'next/server';
import { FALLBACK_ENGLISH } from '@/lib/constants.js';
import { expandDomainShortforms } from '@/lib/facts.js';
import { buildGreetingReply, buildThanksReply, buildIdentityReply, detectConversationIntent } from '@/lib/conversation.js';
import { detectResponseStyle, normalizeDetectedLanguage, translateText } from '@/lib/language.js';
import { retrieveContext, generateAnswer } from '@/lib/rag.js';
import { appendSessionEvent, deleteSession, generateSessionId, getOrCreateSession, loadSession, patchSession } from '@/lib/session-store.js';
import { redactSensitiveUserData } from '@/lib/privacy.js';
import { classifyIntentId } from '@/lib/intent.js';
import { handleSaathiMessage } from '@/lib/saathi-engine.js';
import {
  SAATHI_AUDIO_PROMPT_EN,
  SAATHI_CONSENT_PROMPT_EN,
  SAATHI_LANGUAGE_WELCOME_BLOCK,
  SAATHI_MENU_EN,
  SAATHI_OUT_OF_SCOPE_EN,
  isDeleteDataCommand,
  isMenuCommand,
  isShowDataCommand,
  parseConsentSelection,
  parseLanguageSelection
} from '@/lib/saathi.js';

function tightenAnswer(query, answer) {
  let output = String(answer || '').trim().replace(/\s+/g, ' ');
  if (!output) return output;

  const q = expandDomainShortforms(query || '').toLowerCase();
  const nameMatch = output.match(/(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Ar\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}/);
  const urlMatch = output.match(/https?:\/\/[^\s)]+/i);
  const emailMatch = output.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = output.match(/\+?\d[\d\s-]{8,}\d/);
  const feeRangeMatch = output.match(/(?:₹|INR|Rs\.?)\s*[0-9,]+\s*(?:to|-|–)\s*(?:₹|INR|Rs\.?)?\s*[0-9,]+/i);

  if ((q.includes('vice chancellor') || q.includes('vc')) && nameMatch) return nameMatch[0];
  if (q.includes('registrar') && q.match(/\b(email|mail|contact)\b/) && emailMatch) return emailMatch[0];
  if (q.includes('registrar') && nameMatch) return nameMatch[0];
  if (q.includes('ssd') && q.includes('dean') && nameMatch) return nameMatch[0];
  if ((q.includes('sod') || q.includes('school of design')) && q.includes('dean') && nameMatch) return nameMatch[0];
  if (q.includes('hostel') && q.includes('fee') && feeRangeMatch) return `${feeRangeMatch[0]} (mess excluded)`;
  if (q.match(/\b(link|url|website)\b/) && urlMatch) return urlMatch[0];
  if (q.match(/\b(email|mail)\b/) && emailMatch) return emailMatch[0];
  if (q.match(/\b(phone|contact|number|call)\b/) && phoneMatch) return phoneMatch[0];
  if ((q.match(/\bwho\b/) || q.match(/\bname\b/)) && nameMatch && !output.includes(';')) return nameMatch[0];

  output = output
    .replace(/^the\s+(current\s+)?(vice chancellor|registrar|ssd dean|sod dean)\s+(is|:)\s*/i, '')
    .replace(/^answer\s*[:\-]\s*/i, '')
    .trim();

  return output;
}

export async function POST(req) {
  try {
    const { message, history, apiKey, sessionId, preferredLanguage, consent } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const incoming = message.trim();

    const candidateSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
    const clientSessionId = /^[a-zA-Z0-9._-]{8,80}$/.test(candidateSessionId) ? candidateSessionId : generateSessionId();

    let selectedLanguage = preferredLanguage ? normalizeDetectedLanguage(preferredLanguage) : null;
    let consentState = typeof consent === 'string' ? consent : 'unknown';
    if (!['unknown', 'agree', 'decline'].includes(consentState)) consentState = 'unknown';

    let persistedSession = null;
    if (consentState === 'agree') {
      persistedSession = await loadSession(clientSessionId);
      if (!persistedSession) {
        persistedSession = await getOrCreateSession(clientSessionId, { language: selectedLanguage, consent: 'agree' });
      } else if (selectedLanguage && persistedSession.language !== selectedLanguage) {
        persistedSession = await patchSession(clientSessionId, { language: selectedLanguage });
      }
      selectedLanguage = persistedSession.language ? normalizeDetectedLanguage(persistedSession.language) : selectedLanguage;
      consentState = persistedSession.consent || 'agree';
    }

    const activeSessionId = persistedSession?.id || clientSessionId;

    const reply = async (text, language, sources = [], options = {}) => {
      const preserveFormatting = Boolean(options.preserveFormatting);
      const sessionExtra = options.sessionExtra && typeof options.sessionExtra === 'object' ? options.sessionExtra : {};

      return NextResponse.json(
        {
          answer: preserveFormatting ? String(text || '') : tightenAnswer(incoming, text),
          language: language || selectedLanguage || 'en',
          sources,
          session: { id: activeSessionId, language: selectedLanguage, consent: consentState, ...sessionExtra }
        },
        { status: 200 }
      );
    };

    // Privacy commands always available (no consent required)
    if (isDeleteDataCommand(incoming)) {
      await deleteSession(activeSessionId);
      consentState = 'unknown';
      return reply('Your session data has been deleted.', selectedLanguage || 'en', [], {
        preserveFormatting: true,
        sessionExtra: { consent: 'unknown' }
      });
    }

    if (isShowDataCommand(incoming)) {
      if (consentState !== 'agree') {
        return reply('No personal session data is stored because consent was not granted.', selectedLanguage || 'en', [], { preserveFormatting: true });
      }
      const record = persistedSession || (await loadSession(activeSessionId));
      if (!record) return reply('No session data found for this session.', selectedLanguage || 'en', [], { preserveFormatting: true });
      return reply(JSON.stringify(record, null, 2), selectedLanguage || 'en', [], { preserveFormatting: true });
    }

    // Stage 1: language selection (no storage before consent)
    if (!selectedLanguage) {
      const picked = parseLanguageSelection(incoming);
      if (!picked) {
        return reply(SAATHI_LANGUAGE_WELCOME_BLOCK, 'en', [], { preserveFormatting: true, sessionExtra: { consent: 'unknown' } });
      }
      selectedLanguage = normalizeDetectedLanguage(picked);
      const consentText = await translateText(SAATHI_CONSENT_PROMPT_EN, selectedLanguage, { concise: false });
      return reply(consentText || SAATHI_CONSENT_PROMPT_EN, selectedLanguage, [], {
        preserveFormatting: true,
        sessionExtra: { language: selectedLanguage, consent: 'unknown' }
      });
    }

    // Stage 2: consent (persist only after agree)
    if (consentState === 'unknown') {
      const picked = parseConsentSelection(incoming);
      if (!picked) {
        const consentText = await translateText(SAATHI_CONSENT_PROMPT_EN, selectedLanguage, { concise: false });
        return reply(consentText || SAATHI_CONSENT_PROMPT_EN, selectedLanguage, [], { preserveFormatting: true });
      }

      consentState = picked === 'agree' ? 'agree' : 'decline';

      if (consentState === 'agree') {
        persistedSession = await getOrCreateSession(activeSessionId, { language: selectedLanguage, consent: 'agree' });
      }

      const menuText = await translateText(SAATHI_MENU_EN, selectedLanguage, { concise: false });
      const confirmTextEn =
        consentState === 'agree'
          ? `Thank you. How can I help you today?\n\n${SAATHI_MENU_EN}`
          : `Understood. I will continue with general FAQs only.\n\n${SAATHI_MENU_EN}`;
      const confirmText = await translateText(confirmTextEn, selectedLanguage, { concise: false });
      return reply(confirmText || menuText || SAATHI_MENU_EN, selectedLanguage, [], {
        preserveFormatting: true,
        sessionExtra: { consent: consentState }
      });
    }

    // MENU is always available after language selection
    if (isMenuCommand(incoming)) {
      const menuText = await translateText(SAATHI_MENU_EN, selectedLanguage, { concise: false });
      return reply(menuText || SAATHI_MENU_EN, selectedLanguage, [], { preserveFormatting: true });
    }

    const style = detectResponseStyle(incoming, selectedLanguage);
    const replyLanguage = selectedLanguage;

    const convoIntent = detectConversationIntent(incoming);
    if (convoIntent === 'greeting') {
      const answer = await buildGreetingReply(replyLanguage, style);
      if (consentState === 'agree') {
        await appendSessionEvent(activeSessionId, { role: 'user', text: redactSensitiveUserData(incoming), intent: 'INT-17' });
        await appendSessionEvent(activeSessionId, { role: 'assistant', text: answer, intent: 'INT-17' });
      }
      return reply(answer, replyLanguage, []);
    }

    if (convoIntent === 'thanks') {
      const answer = await buildThanksReply(replyLanguage, style);
      if (consentState === 'agree') {
        await appendSessionEvent(activeSessionId, { role: 'user', text: redactSensitiveUserData(incoming), intent: 'INT-17' });
        await appendSessionEvent(activeSessionId, { role: 'assistant', text: answer, intent: 'INT-17' });
      }
      return reply(answer, replyLanguage, []);
    }

    if (convoIntent === 'identity') {
      const answer = await buildIdentityReply(replyLanguage, style);
      if (consentState === 'agree') {
        await appendSessionEvent(activeSessionId, { role: 'user', text: redactSensitiveUserData(incoming), intent: 'INT-17' });
        await appendSessionEvent(activeSessionId, { role: 'assistant', text: answer, intent: 'INT-17' });
      }
      return reply(answer, replyLanguage, []);
    }

    const primaryIntentId = classifyIntentId(incoming);
    const sessionState = consentState === 'agree' ? (persistedSession?.state || {}) : {};
    const unknownCount = consentState === 'agree' ? Number(persistedSession?.unknownIntentCount || 0) : 0;

    const scripted = await handleSaathiMessage({
      intentId: primaryIntentId,
      message: incoming,
      state: sessionState,
      unknownIntentCount: unknownCount
    });

    if (scripted?.handled) {
      const baseText = scripted.textEn || (SAATHI_OUT_OF_SCOPE_EN || FALLBACK_ENGLISH);
      let translated = baseText;
      if (replyLanguage !== 'en') {
        translated = await translateText(baseText, replyLanguage, { style, concise: false });
      }

      const audioText = translated;
      if (primaryIntentId !== 'INT-18') {
        const audioPrompt = await translateText(SAATHI_AUDIO_PROMPT_EN, replyLanguage, { concise: true });
        translated = `${translated}\n\n${audioPrompt || SAATHI_AUDIO_PROMPT_EN}`;
      }

      if (consentState === 'agree') {
        const nextUnknown = Number.isFinite(scripted.unknownIntentCount)
          ? scripted.unknownIntentCount
          : primaryIntentId === 'INT-18'
            ? unknownCount + 1
            : 0;
        const nextState = scripted.newState ?? sessionState;

        persistedSession = await patchSession(activeSessionId, { state: nextState, unknownIntentCount: nextUnknown });
        await appendSessionEvent(activeSessionId, { role: 'user', text: redactSensitiveUserData(incoming), intent: primaryIntentId });
        await appendSessionEvent(activeSessionId, { role: 'assistant', text: translated, intent: primaryIntentId });
      }

      return reply(translated, replyLanguage, scripted.sources || [], {
        preserveFormatting: true,
        sessionExtra: { intent: primaryIntentId, audioPrompt: primaryIntentId !== 'INT-18', audioText }
      });
    }

    const fallbackText = async () => {
      const base = SAATHI_OUT_OF_SCOPE_EN || FALLBACK_ENGLISH;
      const translated = await translateText(base, replyLanguage, { style, concise: true });
      return translated || base;
    };

    if (consentState === 'agree') {
      if ((persistedSession?.unknownIntentCount || 0) !== 0) {
        persistedSession = await patchSession(activeSessionId, { unknownIntentCount: 0 });
      }
      await appendSessionEvent(activeSessionId, { role: 'user', text: redactSensitiveUserData(incoming), intent: primaryIntentId });
    }

    const retrieval = await retrieveContext(incoming, {
      topK: Number(process.env.RAG_TOP_K || 6),
      minScore: Number(process.env.RAG_MIN_SCORE || 0.11),
      lexicalFloor: Number(process.env.RAG_LEXICAL_FLOOR || 0.12)
    });

    if (!retrieval.hasConfidentMatch) {
      const translatedFallback = await fallbackText();
      const audioPrompt = await translateText(SAATHI_AUDIO_PROMPT_EN, replyLanguage, { concise: true });
      const assistantText = `${translatedFallback} ${audioPrompt || SAATHI_AUDIO_PROMPT_EN}`;
      if (consentState === 'agree') {
        await appendSessionEvent(activeSessionId, { role: 'assistant', text: assistantText, intent: 'fallback' });
      }
      return reply(
        assistantText,
        replyLanguage,
        retrieval.ranked.slice(0, 2).map((s) => ({ title: s.title, source: s.source, score: Number(s.score.toFixed(4)) })),
        { sessionExtra: { intent: primaryIntentId, audioPrompt: true, audioText: translatedFallback } }
      );
    }

    const generated = await generateAnswer({
      query: incoming,
      language: replyLanguage,
      history,
      contextItems: retrieval.confident,
      responseStyle: style,
      clientApiKey: apiKey
    });

    let answer = generated.answer;

    if (!answer || answer === '__FALLBACK__') {
      answer = await fallbackText();
    } else if (replyLanguage !== 'en') {
      answer = await translateText(answer, replyLanguage, { style, concise: true });
    }

    if (answer.trim() === FALLBACK_ENGLISH && replyLanguage !== 'en') {
      answer = await fallbackText();
    }

    const audioPrompt = await translateText(SAATHI_AUDIO_PROMPT_EN, replyLanguage, { concise: true });
    const assistantText = `${answer} ${audioPrompt || SAATHI_AUDIO_PROMPT_EN}`;

    if (consentState === 'agree') {
      await appendSessionEvent(activeSessionId, { role: 'assistant', text: assistantText, intent: 'answer' });
    }

    return reply(
      assistantText,
      replyLanguage,
      retrieval.confident.slice(0, 4).map((s) => ({ title: s.title, source: s.source, score: Number(s.score.toFixed(4)) })),
      { sessionExtra: { intent: primaryIntentId, audioPrompt: true, audioText: answer } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        answer: 'Server error. Please try again.',
        language: 'en',
        sources: [],
        error: error.message
      },
      { status: 500 }
    );
  }
}
