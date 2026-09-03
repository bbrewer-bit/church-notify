import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";
import { formatPhoneForDisplay } from "@/lib/phone";

export default async function BlastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = supabaseService();

  const [{ data: blast }, { data: logs }] = await Promise.all([
    supabase.from("blasts").select("*").eq("id", id).single(),
    supabase
      .from("message_log")
      .select("*")
      .eq("blast_id", id)
      .order("contact_name_snapshot"),
  ]);

  if (!blast) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Announcement details
      </h1>
      <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">
          {new Date(blast.created_at).toLocaleString()} ·{" "}
          <span className="capitalize">{blast.channel}</span> ·{" "}
          {blast.group_name_snapshot ?? "All congregants"}
          {blast.created_by && ` · sent by ${blast.created_by}`}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-slate-900">
          {blast.message}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Channel</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(logs ?? []).map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 text-slate-900">
                  {log.contact_name_snapshot ?? "—"}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {formatPhoneForDisplay(log.phone)}
                </td>
                <td className="px-4 py-2 capitalize text-slate-700">
                  {log.channel}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={log.status} />
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {log.opted_out
                    ? "Opted out during this call"
                    : log.error_message ?? ""}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>
                  No recipient detail recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const good = ["delivered", "completed", "sent", "answered"].includes(
    status
  );
  const bad = ["failed", "undelivered", "busy", "no-answer", "canceled"].includes(
    status
  );
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        good
          ? "bg-green-100 text-green-700"
          : bad
          ? "bg-red-100 text-red-700"
          : "bg-slate-200 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
