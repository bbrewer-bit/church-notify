import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";

export default async function DashboardPage() {
  const supabase = supabaseService();

  const [
    { count: totalContacts },
    { count: smsOptedOut },
    { count: voiceOptedOut },
    { count: totalGroups },
    { data: recentBlasts },
  ] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("sms_opt_in", false),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("voice_opt_in", false),
    supabase.from("groups").select("id", { count: "exact", head: true }),
    supabase
      .from("blasts")
      .select("id, channel, message, status, recipient_count, sent_count, failed_count, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Congregants", value: totalContacts ?? 0 },
    { label: "Groups", value: totalGroups ?? 0 },
    { label: "Opted out of texts", value: smsOptedOut ?? 0 },
    { label: "Opted out of calls", value: voiceOptedOut ?? 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          A quick look at your congregation list and recent announcements.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="text-2xl font-semibold text-slate-900">
              {stat.value}
            </div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/send"
          className="rounded-md bg-[#0b2a4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2440]"
        >
          Send an announcement
        </Link>
        <Link
          href="/contacts"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Manage congregants
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent announcements
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Channel</th>
                <th className="px-4 py-2 font-medium">Message</th>
                <th className="px-4 py-2 font-medium">Sent / Failed</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentBlasts ?? []).map((blast) => (
                <tr key={blast.id}>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(blast.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize text-slate-700">
                    {blast.channel}
                  </td>
                  <td className="max-w-xs truncate px-4 py-2 text-slate-700">
                    {blast.message}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {blast.sent_count} / {blast.failed_count}
                  </td>
                  <td className="px-4 py-2 capitalize text-slate-700">
                    {blast.status}
                  </td>
                </tr>
              ))}
              {(!recentBlasts || recentBlasts.length === 0) && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-400"
                    colSpan={5}
                  >
                    No announcements sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
