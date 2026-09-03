import { supabaseService } from "@/lib/supabase/service";
import SendForm from "./SendForm";

export const maxDuration = 60;

export default async function SendPage() {
  const supabase = supabaseService();

  const [{ data: contacts }, { data: groups }, { data: memberships }] =
    await Promise.all([
      supabase.from("contacts").select("id, sms_opt_in, voice_opt_in"),
      supabase.from("groups").select("id, name").order("name"),
      supabase.from("group_members").select("group_id, contact_id"),
    ]);

  const contactById = new Map((contacts ?? []).map((c) => [c.id, c]));

  const totalSms = (contacts ?? []).filter((c) => c.sms_opt_in).length;
  const totalVoice = (contacts ?? []).filter((c) => c.voice_opt_in).length;

  const audiences = [
    { id: "all", label: "All congregants", smsCount: totalSms, voiceCount: totalVoice },
    ...(groups ?? []).map((g) => {
      const memberIds = (memberships ?? [])
        .filter((m) => m.group_id === g.id)
        .map((m) => m.contact_id);
      const smsCount = memberIds.filter(
        (id) => contactById.get(id)?.sms_opt_in
      ).length;
      const voiceCount = memberIds.filter(
        (id) => contactById.get(id)?.voice_opt_in
      ).length;
      return { id: g.id, label: g.name, smsCount, voiceCount };
    }),
  ];

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Send an announcement
      </h1>
      <p className="text-sm text-slate-500">
        Reaches only congregants who haven&apos;t opted out of that channel.
      </p>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <SendForm audiences={audiences} />
      </div>
    </div>
  );
}
