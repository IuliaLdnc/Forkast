export function sanitizeDecimal(text: string, maxInt = 4, maxFrac = 2): string {
  const normalized = text.replace(/[^0-9.,]/g, '').replace(/\./g, ',');
  const [intPart, ...fracParts] = normalized.split(',');
  let out = intPart.slice(0, maxInt);
  if (fracParts.length > 0) out += ',' + fracParts.join('').slice(0, maxFrac);
  return out;
}

export function sanitizeInteger(text: string, maxLen = 4): string {
  return text.replace(/[^0-9]/g, '').slice(0, maxLen);
}

export function parseNumber(text: string): number {
  return Number(text.replace(',', '.')) || 0;
}

export function formatDecimal(value: number, lang: string): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return lang === 'ru' ? text.replace('.', ',') : text;
}
