function redactPhoneNumbers(text) {
  return (text || '').replace(/(\+?\d[\d\s-]{7,}\d)/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length < 10) return match;
    const tail = digits.slice(-4);
    return `[REDACTED_PHONE_****${tail}]`;
  });
}

function redactIdLikeTokens(text) {
  return (text || '').replace(/\b([A-Z]{2,5}[- ]?\d{4,})\b/g, '[REDACTED_ID]');
}

export function redactSensitiveUserData(text) {
  let output = String(text || '');
  output = redactPhoneNumbers(output);
  output = redactIdLikeTokens(output);
  return output;
}

