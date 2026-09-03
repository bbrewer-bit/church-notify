"use server";

import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabase/service";
import { sendSms, placeVoiceCall } from "@/lib/twilio";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export type SendState =
  | {
      error?: string;
      success?: {
        recipientCount: number;
        sent: number;
        failed: number;
      };
    }
  | undefined;

const DELAY_MS = 150;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type RecipientRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  sms_opt_in: boolean;
  voice_opt_in: boolean;
};

export async function sendBlast(
  _prevState: SendState,
  formData: FormData
): Promise<SendState> {
  const audienceId = String(formData.get("audience_id") ?? "");
  const channel = String(formData.get("channel") ?? "") as
    | "sms"
    | "voice"
    | "both";
  const message = String(formData.get("message") ?? "").trim();
  const confirmed = formData.get("confirm") === "on";

  if (!audienceId) return { error: "Choose who to send this to." };
  if (!["sms", "voice", "both"].includes(channel)) {
    return { error: "Choose how to send this." };
  }
  if (!message) return { error: "Write a message first." };
  if (!confirmed) {
    return { error: "Please check the confirmation box before sending." };
  }

  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value
  );

  const supabase = supabaseService();

  let recipients: RecipientRow[] = [];
  let groupId: string | null = null;
  let groupName = "All congregants";

  if (audienceId === "all") {
    const { data } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, phone, sms_opt_in, voice_opt_in");
    recipients = data ?? [];
  } else {
    groupId = audienceId;
    const { data: group } = await supabase
      .from("groups")
      .select("name")
      .eq("id", audienceId)
      .single();
    groupName = group?.name ?? "Group";

    const { data } = await supabase
      .from("group_members")
      .select(
        "contacts(id, first_name, last_name, phone, sms_opt_in, voice_opt_in)"
      )
      .eq("group_id", audienceId);

    recipients = (data ?? [])
      .map((row) => row.contacts)
      .filter(Boolean) as unknown as RecipientRow[];
  }

  const smsRecipients =
    channel === "sms" || channel === "both"
      ? recipients.filter((c) => c.sms_opt_in && c.phone)
      : [];
  const voiceRecipients =
    channel === "voice" || channel === "both"
      ? recipients.filter((c) => c.voice_opt_in && c.phone)
      : [];

  const touched = new Set([
    ...smsRecipients.map((c) => c.id),
    ...voiceRecipients.map((c) => c.id),
  ]);

  if (touched.size === 0) {
    return {
      error:
        "Nobody in this audience is opted in to that channel right now.",
    };
  }

  const { data: blast, error: blastError } = await supabase
    .from("blasts")
    .insert({
      channel,
      message,
      group_id: groupId,
      group_name_snapshot: groupName,
      created_by: session?.name ?? null,
      status: "sending",
      recipient_count: touched.size,
    })
    .select()
    .single();

  if (blastError || !blast) {
    return { error: blastError?.message ?? "Could not start the send." };
  }

  let sent = 0;
  let failed = 0;

  for (const contact of smsRecipients) {
    try {
      const result = await sendSms({ to: contact.phone, body: message });
      await supabase.from("message_log").insert({
        blast_id: blast.id,
        contact_id: contact.id,
        contact_name_snapshot: `${contact.first_name} ${contact.last_name}`,
        phone: contact.phone,
        channel: "sms",
        twilio_sid: result.sid,
        status: result.status,
      });
      sent++;
    } catch (err) {
      await supabase.from("message_log").insert({
        blast_id: blast.id,
        contact_id: contact.id,
        contact_name_snapshot: `${contact.first_name} ${contact.last_name}`,
        phone: contact.phone,
        channel: "sms",
        status: "failed",
        error_message: err instanceof Error ? err.message : String(err),
      });
      failed++;
    }
    await sleep(DELAY_MS);
  }

  for (const contact of voiceRecipients) {
    try {
      const result = await placeVoiceCall({
        to: contact.phone,
        blastId: blast.id,
      });
      await supabase.from("message_log").insert({
        blast_id: blast.id,
        contact_id: contact.id,
        contact_name_snapshot: `${contact.first_name} ${contact.last_name}`,
        phone: contact.phone,
        channel: "voice",
        twilio_sid: result.sid,
        status: result.status,
      });
      sent++;
    } catch (err) {
      await supabase.from("message_log").insert({
        blast_id: blast.id,
        contact_id: contact.id,
        contact_name_snapshot: `${contact.first_name} ${contact.last_name}`,
        phone: contact.phone,
        channel: "voice",
        status: "failed",
        error_message: err instanceof Error ? err.message : String(err),
      });
      failed++;
    }
    await sleep(DELAY_MS);
  }

  await supabase
    .from("blasts")
    .update({
      status: "completed",
      sent_count: sent,
      failed_count: failed,
      completed_at: new Date().toISOString(),
    })
    .eq("id", blast.id);

  return {
    success: { recipientCount: touched.size, sent, failed },
  };
}
