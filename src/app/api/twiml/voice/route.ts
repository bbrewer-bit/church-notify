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

  const gather = response.gather({
    numDigits: 1,
    action: `/api/twiml/gather?blastId=${encodeURIComponent(blastId ?? "")}`,
    method: "POST",
    timeout: 6,
  });
  gather.pause({ length: 2 });
  gather.say(
    { voice: "Polly.Joanna" },
    "Hello, this is Spruce Pine Grove Baptist Church with an announcement."
  );
  gather.pause({ length: 1 });
  gather.say(
    { voice: "Polly.Joanna" },
    `${message}. To hear this message again, press 1. To be removed from future phone announcements, press 9.`
  );
  response.say({ voice: "Polly.Joanna" }, "Thank you. Goodbye.");

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
