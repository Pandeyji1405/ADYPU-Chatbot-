import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { decryptJson, encryptJson } from './crypto.js';

const DEFAULT_SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');
const FALLBACK_SESSIONS_DIR = path.join(process.env.TMPDIR || '/tmp', 'adypu-saathi-sessions');

let resolvedSessionsDir = null;

function shouldPreferTmpSessions() {
  return Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function sessionsDir() {
  if (resolvedSessionsDir) return resolvedSessionsDir;

  const explicit = process.env.SESSIONS_DIR;
  if (explicit) {
    resolvedSessionsDir = explicit;
    return resolvedSessionsDir;
  }

  resolvedSessionsDir = shouldPreferTmpSessions() ? FALLBACK_SESSIONS_DIR : DEFAULT_SESSIONS_DIR;
  return resolvedSessionsDir;
}

function normalizeSessionId(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (!/^[a-zA-Z0-9._-]{8,80}$/.test(raw)) return '';
  return raw;
}

function sessionFilePath(sessionId) {
  return path.join(sessionsDir(), `${sessionId}.json.enc`);
}

async function ensureDir() {
  const dir = sessionsDir();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (process.env.SESSIONS_DIR) throw err;
    resolvedSessionsDir = FALLBACK_SESSIONS_DIR;
    await fs.mkdir(FALLBACK_SESSIONS_DIR, { recursive: true });
  }
}

export function generateSessionId() {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function loadSession(sessionId) {
  const safeId = normalizeSessionId(sessionId);
  if (!safeId) return null;

  try {
    const raw = await fs.readFile(sessionFilePath(safeId), 'utf8');
    const envelope = JSON.parse(raw);
    return decryptJson(envelope);
  } catch {
    return null;
  }
}

export async function saveSession(session) {
  const safeId = normalizeSessionId(session?.id);
  if (!safeId) throw new Error('Invalid session id');

  await ensureDir();
  const envelope = encryptJson(session);
  await fs.writeFile(sessionFilePath(safeId), JSON.stringify(envelope), 'utf8');
}

export async function getOrCreateSession(sessionId, seed = {}) {
  const existing = await loadSession(sessionId);
  if (existing) return existing;

  const id = normalizeSessionId(sessionId) || generateSessionId();
  const now = new Date().toISOString();
  const session = {
    id,
    createdAt: now,
    updatedAt: now,
    language: seed.language || null,
    consent: seed.consent || 'unknown',
    unknownIntentCount: 0,
    state: {},
    events: []
  };

  await saveSession(session);
  return session;
}

export async function deleteSession(sessionId) {
  const safeId = normalizeSessionId(sessionId);
  if (!safeId) return;
  try {
    await fs.unlink(sessionFilePath(safeId));
  } catch {
    // ignore
  }
}

export async function appendSessionEvent(sessionId, event, options = {}) {
  const session = await getOrCreateSession(sessionId);
  const now = new Date().toISOString();
  const maxEvents = Number(options.maxEvents || 200);

  const safeEvent = {
    ts: now,
    role: event?.role || 'system',
    text: String(event?.text || ''),
    intent: event?.intent || null,
    meta: event?.meta || null
  };

  session.events = Array.isArray(session.events) ? session.events : [];
  session.events.push(safeEvent);

  if (session.events.length > maxEvents) {
    session.events = session.events.slice(session.events.length - maxEvents);
  }

  session.updatedAt = now;
  await saveSession(session);
  return session;
}

export async function patchSession(sessionId, patch) {
  const session = await getOrCreateSession(sessionId);
  session.updatedAt = new Date().toISOString();

  if (patch && typeof patch === 'object') {
    if (Object.prototype.hasOwnProperty.call(patch, 'language')) session.language = patch.language;
    if (Object.prototype.hasOwnProperty.call(patch, 'consent')) session.consent = patch.consent;
    if (Object.prototype.hasOwnProperty.call(patch, 'unknownIntentCount')) session.unknownIntentCount = patch.unknownIntentCount;
    if (Object.prototype.hasOwnProperty.call(patch, 'state')) session.state = patch.state;
  }

  await saveSession(session);
  return session;
}
