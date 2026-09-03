import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";

export default async function HistoryPage() {
  const { data: blasts } = await supabaseService()
    .from("blasts")
    .select(
      "id, channel, message, group_name_snapshot, status, recipient_count, sent_count, failed_count, created_at, created_by"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">History</h1>
      <p className="text-sm text-slate-500">
        Every announcement that&rsquo;s gone out, with per-recipient delivery
        status.
      </p>

      <div className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {(blasts ?? []).map((b) => (
          <Link
            key={b.id}
            href={`/history/${b.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{new Date(b.created_at).toLocaleString()}</span>
                <span>·</span>
                <span className="capitalize">{b.channel}</span>
                <span>·</span>
                <span>{b.group_name_snapshot ?? "All congregants"}</span>
                {b.created_by && (
                  <>
                    <span>·</span>
                    <span>{b.created_by}</span>
                  </>
                )}
              </div>
              <div className="truncate text-sm text-slate-900">
                {b.message}
              </div>
            </div>
            <div className="shrink-0 text-right text-sm text-slate-700">
              <div>
                {b.sent_count}/{b.recipient_count} sent
              </div>
              {b.failed_count > 0 && (
                <div className="text-red-600">{b.failed_count} failed</div>
              )}
            </div>
          </Link>
        ))}
        {(!blasts || blasts.length === 0) && (
          <div className="px-4 py-6 text-center text-slate-400">
            No announcements sent yet.
          </div>
        )}
      </div>
    </div>
  );
}
