ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isValidTwilioRequest, twiml, appBaseUrl } from "@/lib/twilio";

// Callers hear the most recent phone announcement, but only if it is recent.
// Older ones are treated as stale so nobody hears an outdated cancellation.
const MAX_AGE_DAYS = 14;
const VOICE = "Polly.Matthew-Neural";
const CHURCH = "Spruce Pine Grove Baptist Church";

// Handles people calling the church number back (for example after missing an
// announcement call). Point the Twilio number's "A call comes in" webhook here.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => (params[key] = String(value)));

  const signature = request.headers.get("X-Twilio-Signature");
  const url = `${appBaseUrl()}${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!isValidTwilioRequest({ url, params, signature })) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const response = twiml();
  const isReplay = params.Digits === "1";

  const cutoff = new Date(
    Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: blast } = await supabaseService()
    .from("blasts")
    .select("message, created_at")
    .in("channel", ["voice", "both"])
    .in("status", ["sending", "completed"])
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!blast?.message) {
    response.say(
      { voice: VOICE },
      `Thank you for calling ${CHURCH}. There are no current announcements. Goodbye.`
    );
    response.hangup();
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const sentOn = new Date(blast.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  const gather = response.gather({
    numDigits: 1,
    action: "/api/twiml/inbound",
    method: "POST",
    timeout: 6,
  });
  gather.pause({ length: 1 });
  if (!isReplay) {
    gather.say(
      { voice: VOICE },
      `Thank you for calling ${CHURCH}. Here is our most recent announcement.`
    );
    gather.pause({ length: 1 });
  }
  gather.say({ voice: VOICE }, `This announcement was sent on ${sentOn}.`);
  gather.pause({ length: 1 });
  gather.say(
    { voice: VOICE },
    `${blast.message}. To hear this message again, press 1.`
  );
  response.say({ voice: VOICE }, "Thank you. Goodbye.");
  response.hangup();

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
