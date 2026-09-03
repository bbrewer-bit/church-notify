"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";
import { toE164 } from "@/lib/phone";

export type FormState = { error?: string; success?: string } | undefined;

export async function createContact(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!firstName) return { error: "First name is required." };
  const phone = toE164(phoneRaw);
  if (!phone) {
    return { error: `"${phoneRaw}" doesn't look like a valid phone number.` };
  }

  const { error } = await supabaseService().from("contacts").insert({
    first_name: firstName,
    last_name: lastName,
    phone,
    email: email || null,
    notes: notes || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A congregant with that phone number already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/contacts");
  return { success: `Added ${firstName}.` };
}

export async function updateContact(id: string, formData: FormData) {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const smsOptIn = formData.get("sms_opt_in") === "on";
  const voiceOptIn = formData.get("voice_opt_in") === "on";

  const phone = toE164(phoneRaw);
  if (!firstName || !phone) {
    redirect(`/contacts/${id}?error=1`);
  }

  await supabaseService()
    .from("contacts")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
      email: email || null,
      notes: notes || null,
      sms_opt_in: smsOptIn,
      voice_opt_in: voiceOptIn,
      opted_out_at: smsOptIn && voiceOptIn ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function deleteContact(id: string) {
  await supabaseService().from("contacts").delete().eq("id", id);
  revalidatePath("/contacts");
}

export type ImportState =
  | { error?: string; imported?: number; skipped?: number }
  | undefined;

export async function importContacts(
  _prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  const csv = String(formData.get("csv") ?? "");
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
  }[] = [];
  let skipped = 0;

  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 2) {
      skipped++;
      continue;
    }
    const [first, last = "", phoneRaw, email = ""] = parts;
    if (/^first[_ ]?name$/i.test(first)) continue; // skip header row
    const phone = toE164(phoneRaw ?? "");
    if (!first || !phone) {
      skipped++;
      continue;
    }
    rows.push({
      first_name: first,
      last_name: last,
      phone,
      email: email || null,
    });
  }

  if (rows.length === 0) {
    return { error: "No valid rows found. Expected: First,Last,Phone,Email" };
  }

  const { error, count } = await supabaseService()
    .from("contacts")
    .upsert(rows, { onConflict: "phone", ignoreDuplicates: true, count: "exact" });

  if (error) return { error: error.message };

  revalidatePath("/contacts");
  return { imported: count ?? rows.length, skipped };
}
