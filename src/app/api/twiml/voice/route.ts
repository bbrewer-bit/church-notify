import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isValidTwilioRequest, twiml, appBaseUrl } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => (params[key] = String(value)));

  const signature = request.headers.get("X-Twilio-Signature");
  const url = `${appBaseUrl()}${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!isValidTwilioRequest({ url, params, signature })) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const blastId = request.nextUrl.searchParams.get("blastId");
  const response = twiml();

  let message = "This announcement is no longer available.";
  if (blastId) {
    const { data: blast } = await supabaseService()
      .from("blasts")
      .select("message")
      .eq("id", blastId)
      .single();
    if (blast?.message) message = blast.message;
  }

   // Set by Twilio's answering machine detection (see placeVoiceCall).
  const answeredBy = params.AnsweredBy ?? "";

  // Fax machine: nothing useful to say.
  if (answeredBy === "fax") {
    response.hangup();
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Voicemail. Twilio has already waited out the greeting and the beep, so
  // everything below is what actually gets recorded. No "press 1 / press 9"
  // prompts here because nobody is there to press anything.
  if (answeredBy.startsWith("machine")) {
    response.pause({ length: 1 });
    response.say(
      { voice: "Polly.Matthew-Neural" },
      "Hello, this is Spruce Pine Grove Baptist Church with an announcement."
    );
    response.pause({ length: 1 });
    response.say({ voice: "Polly.Matthew-Neural" }, `${message}.`);
    response.pause({ length: 1 });
    response.say(
      { voice: "Polly.Matthew-Neural" },
      "You can call this number back any time to hear this message again. To be removed from future phone announcements, please contact the church office. Goodbye."
    );
    response.hangup();
    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
  const gather = response.gather({
    numDigits: 1,
    action: `/api/twiml/gather?blastId=${encodeURIComponent(blastId ?? "")}`,
    method: "POST",
    timeout: 6,
  });
  gather.pause({ length: 2 });
  gather.say(
    { voice: "Polly.Matthew-Neural" },
    "Hello, this is Spruce Pine Grove Baptist Church with an announcement."
  );
  gather.pause({ length: 1 });
  gather.say(
    { voice: "Polly.Matthew-Neural" },
    `${message}. To hear this message again, press 1. To be removed from future phone announcements, press 9.`
  );
  response.say({ voice: "Polly.Matthew-Neural" }, "Thank you. Goodbye.");

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
