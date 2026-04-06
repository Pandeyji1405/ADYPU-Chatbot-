import crypto from 'node:crypto';

const KEY_BYTES = 32;
const IV_BYTES = 12; // recommended for GCM

function deriveKeyBytes() {
  const raw = process.env.SESSION_ENCRYPTION_KEY;

  if (!raw) {
    const fallback = 'adypu-saathi-dev-session-key';
    return crypto.createHash('sha256').update(fallback).digest();
  }

  try {
    const base64 = Buffer.from(raw, 'base64');
    if (base64.length === KEY_BYTES) return base64;
  } catch {
    // ignore
  }

  try {
    const hex = Buffer.from(raw, 'hex');
    if (hex.length === KEY_BYTES) return hex;
  } catch {
    // ignore
  }

  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptJson(payload) {
  const key = deriveKeyBytes();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: ciphertext.toString('base64')
  };
}

export function decryptJson(envelope) {
  if (!envelope || envelope.alg !== 'aes-256-gcm' || envelope.v !== 1) {
    throw new Error('Unsupported encryption envelope');
  }

  const key = deriveKeyBytes();
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const data = Buffer.from(envelope.data, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

