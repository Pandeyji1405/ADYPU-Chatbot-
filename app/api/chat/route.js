import { NextResponse } from 'next/server';
import { FALLBACK_ENGLISH } from '@/lib/constants.js';
import { expandDomainShortforms } from '@/lib/facts.js';
import { buildGreetingReply, buildThanksReply, buildIdentityReply, detectConversationIntent } from '@/lib/conversation.js';
import {
  detectLanguage,
  detectResponseStyle,
  normalizeDetectedLanguage,
  translateFallback,
  translateText
} from '@/lib/language.js';
import { retrieveContext, generateAnswer } from '@/lib/rag.js';

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

  if (!q.match(/\b(list|all|and|compare|difference|vs|versus)\b/) && output.includes('\n')) {
    output = output.split('\n')[0].trim();
  }

  return output;
}

export async function POST(req) {
  try {
    const { message, history, apiKey } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const detected = await detectLanguage(message);
    const language = normalizeDetectedLanguage(detected);
    const style = detectResponseStyle(message, language);
    const replyLanguage = style === 'hinglish' ? 'hi' : language;

    const intent = detectConversationIntent(message);
    if (intent === 'greeting') {
      const answer = await buildGreetingReply(replyLanguage, style);
      return NextResponse.json({ answer, language: replyLanguage, sources: [] });
    }

    if (intent === 'thanks') {
      const answer = await buildThanksReply(replyLanguage, style);
      return NextResponse.json({ answer, language: replyLanguage, sources: [] });
    }

    if (intent === 'identity') {
      const answer = await buildIdentityReply(replyLanguage, style);
      return NextResponse.json({ answer, language: replyLanguage, sources: [] });
    }

    const fallbackText = async () => {
      if (style === 'hinglish') {
        const hinglishFallback = await translateText(FALLBACK_ENGLISH, 'hi', { style: 'hinglish', concise: true });
        return hinglishFallback || FALLBACK_ENGLISH;
      }
      return translateFallback(replyLanguage);
    };

    const retrieval = await retrieveContext(message, {
      topK: Number(process.env.RAG_TOP_K || 6),
      minScore: Number(process.env.RAG_MIN_SCORE || 0.11),
      lexicalFloor: Number(process.env.RAG_LEXICAL_FLOOR || 0.12)
    });

    if (!retrieval.hasConfidentMatch) {
      const translatedFallback = await fallbackText();
      return NextResponse.json({
        answer: tightenAnswer(message, translatedFallback),
        language: replyLanguage,
        sources: retrieval.ranked.slice(0, 2).map((s) => ({
          title: s.title,
          source: s.source,
          score: Number(s.score.toFixed(4))
        }))
      });
    }

    const generated = await generateAnswer({
      query: message,
      language: replyLanguage,
      history,
      contextItems: retrieval.confident,
      responseStyle: style,
      clientApiKey: apiKey
    });

    let answer = generated.answer;

    if (!answer || answer === '__FALLBACK__') {
      answer = await fallbackText();
    } else if (style === 'hinglish') {
      answer = await translateText(answer, 'hi', { style: 'hinglish', concise: true });
    } else if (replyLanguage !== 'en') {
      answer = await translateText(answer, replyLanguage, { style, concise: true });
    }

    if (answer.trim() === FALLBACK_ENGLISH && replyLanguage !== 'en') {
      answer = await fallbackText();
    }

    return NextResponse.json({
      answer: tightenAnswer(message, answer),
      language: replyLanguage,
      sources: retrieval.confident.slice(0, 4).map((s) => ({
        title: s.title,
        source: s.source,
        score: Number(s.score.toFixed(4))
      }))
    });
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
