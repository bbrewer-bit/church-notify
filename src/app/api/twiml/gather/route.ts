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

  const digits = params.Digits;
  const callSid = params.CallSid;
  const response = twiml();

  if (digits === "9" && callSid) {
    const supabase = supabaseService();
    const { data: log } = await supabase
      .from("message_log")
      .select("id, contact_id")
      .eq("twilio_sid", callSid)
      .maybeSingle();

    if (log?.contact_id) {
      await supabase
        .from("contacts")
        .update({
          voice_opt_in: false,
          opted_out_at: new Date().toISOString(),
        })
        .eq("id", log.contact_id);
      await supabase
        .from("message_log")
        .update({ opted_out: true })
        .eq("id", log.id);
    }

    response.say(
      { voice: "Polly.Joanna" },
      "You have been removed from future phone announcements. Goodbye."
    );
  } else {
    response.say({ voice: "Polly.Joanna" }, "Thank you. Goodbye.");
  }
  response.hangup();

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
