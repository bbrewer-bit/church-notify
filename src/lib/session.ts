// Lightweight signed-cookie session for the small set of church staff admins.
// Runs on the Edge middleware runtime, so it uses Web Crypto (no Node "crypto").

const encoder = new TextEncoder();

export const SESSION_COOKIE = "church_notify_session";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_MAX_AGE = THIRTY_DAYS_SECONDS;

async function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  arr.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export type Session = { name: string };

export async function createSessionToken(name: string): Promise<string> {
  const expires = Date.now() + THIRTY_DAYS_SECONDS * 1000;
  const payload = `${name}|${expires}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${toBase64Url(encoder.encode(payload))}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<Session | null> {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey();
    const payloadBytes = fromBase64Url(payloadB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64),
      payloadBytes
    );
    if (!valid) return null;

    const payload = new TextDecoder().decode(payloadBytes);
    const [name, expiresStr] = payload.split("|");
    const expires = Number(expiresStr);
    if (!name || Number.isNaN(expires) || Date.now() > expires) return null;
    return { name };
  } catch {
    return null;
  }
}

/** ADMIN_USERS env format: "Brandon:somepassword,Sarah:otherpassword" */
export function parseAdminUsers(): Map<string, string> {
  const raw = process.env.ADMIN_USERS ?? "";
  const map = new Map<string, string>();
  raw.split(",").forEach((pair) => {
    const idx = pair.indexOf(":");
    if (idx === -1) return;
    const name = pair.slice(0, idx).trim();
    const password = pair.slice(idx + 1).trim();
    if (name && password) map.set(name, password);
  });
  return map;
}
