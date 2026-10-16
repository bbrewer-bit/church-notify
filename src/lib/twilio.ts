import twilio from "twilio";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} env var is not set`);
  return value;
}

let client: ReturnType<typeof twilio> | null = null;

function twilioClient() {
  if (!client) {
    client = twilio(
      requiredEnv("TWILIO_ACCOUNT_SID"),
      requiredEnv("TWILIO_AUTH_TOKEN")
    );
  }
  return client;
}

export function appBaseUrl(): string {
  const url = process.env.APP_BASE_URL;
  if (!url) throw new Error("APP_BASE_URL env var is not set");
  return url.replace(/\/$/, "");
}

export async function sendSms(opts: { to: string; body: string }) {
  return twilioClient().messages.create({
    to: opts.to,
    from: requiredEnv("TWILIO_FROM_NUMBER"),
    body: opts.body,
    statusCallback: `${appBaseUrl()}/api/webhooks/sms-status`,
  });
}

export async function placeVoiceCall(opts: { to: string; blastId: string }) {
  return twilioClient().calls.create({
    to: opts.to,
    from: requiredEnv("TWILIO_FROM_NUMBER"),
    url: `${appBaseUrl()}/api/twiml/voice?blastId=${encodeURIComponent(
      opts.blastId
    )}`,
    statusCallback: `${appBaseUrl()}/api/webhooks/call-status`,
    statusCallbackEvent: ["initiated", "answered", "completed"],
   // Wait for a voicemail greeting to finish (the beep) before running the
   // announcement, so the message isn't spoken over the greeting.
   machineDetection: "DetectMessageEnd",
  });
}

/** Validates that a webhook request actually came from Twilio. */
export function isValidTwilioRequest(opts: {
  url: string;
  params: Record<string, string>;
  signature: string | null;
}): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !opts.signature) return false;
  return twilio.validateRequest(
    authToken,
    opts.signature,
    opts.url,
    opts.params
  );
}

export function twiml() {
  return new twilio.twiml.VoiceResponse();
}

export function messagingTwiml() {
  return new twilio.twiml.MessagingResponse();
}
