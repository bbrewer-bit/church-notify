import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isValidTwilioRequest, appBaseUrl } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => (params[key] = String(value)));

  const signature = request.headers.get("X-Twilio-Signature");
  const url = `${appBaseUrl()}${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!isValidTwilioRequest({ url, params, signature })) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const sid = params.CallSid;
  const status = params.CallStatus;

  if (sid && status) {
    await supabaseService()
      .from("message_log")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("twilio_sid", sid);
  }

  return new NextResponse(null, { status: 204 });
}
