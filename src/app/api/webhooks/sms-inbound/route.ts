import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isValidTwilioRequest, messagingTwiml, appBaseUrl } from "@/lib/twilio";

const STOP_WORDS = ["stop", "stopall", "unsubscribe", "cancel", "end", "quit"];
const START_WORDS = ["start", "unstop", "yes"];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => (params[key] = String(value)));

  const signature = request.headers.get("X-Twilio-Signature");
  const url = `${appBaseUrl()}${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!isValidTwilioRequest({ url, params, signature })) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const from = params.From;
  const body = (params.Body ?? "").trim().toLowerCase();
  const response = messagingTwiml();

  if (from) {
    const supabase = supabaseService();
    if (STOP_WORDS.includes(body)) {
      await supabase
        .from("contacts")
        .update({
          sms_opt_in: false,
          opted_out_at: new Date().toISOString(),
        })
        .eq("phone", from);
      response.message(
        "You've been unsubscribed from church text announcements and won't receive more. Reply START to resubscribe."
      );
    } else if (START_WORDS.includes(body)) {
      await supabase
        .from("contacts")
        .update({ sms_opt_in: true })
        .eq("phone", from);
      response.message("You're resubscribed to church text announcements.");
    }
  }

  return new NextResponse(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
