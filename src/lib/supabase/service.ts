import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the Supabase service role key. This bypasses Row
// Level Security, so it must NEVER be imported into client components and
// the key must never be exposed with a NEXT_PUBLIC_ prefix.
let client: SupabaseClient | null = null;

export function supabaseService(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
      );
    }
    client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  sms_opt_in: boolean;
  voice_opt_in: boolean;
  opted_out_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Blast = {
  id: string;
  channel: "sms" | "voice" | "both";
  message: string;
  group_id: string | null;
  group_name_snapshot: string | null;
  created_by: string | null;
  status: "pending" | "sending" | "completed" | "failed";
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  completed_at: string | null;
};

export type MessageLog = {
  id: string;
  blast_id: string;
  contact_id: string | null;
  contact_name_snapshot: string | null;
  phone: string;
  channel: "sms" | "voice";
  twilio_sid: string | null;
  status: string;
  error_message: string | null;
  opted_out: boolean;
  created_at: string;
  updated_at: string;
};
