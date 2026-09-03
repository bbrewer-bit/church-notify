/**
 * Normalizes a US/Canada-style phone number to E.164 (+1XXXXXXXXXX).
 * Returns null if the input can't be confidently normalized.
 */
export function toE164(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/[^\d+]/g, "");
    return /^\+[1-9]\d{7,14}$/.test(digits) ? digits : null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function formatPhoneForDisplay(e164: string): string {
  const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  if (!match) return e164;
  return `(${match[1]}) ${match[2]}-${match[3]}`;
}
