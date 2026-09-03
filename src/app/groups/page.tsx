import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";
import CreateGroupForm from "./CreateGroupForm";

export default async function GroupsPage() {
  const supabase = supabaseService();
  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, description")
    .order("name");

  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id");

  const counts = new Map<string, number>();
  (memberCounts ?? []).forEach((row) => {
    counts.set(row.group_id, (counts.get(row.group_id) ?? 0) + 1);
  });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Groups</h1>
      <p className="text-sm text-slate-500">
        Organize congregants so you can message just the people who need it —
        e.g. &ldquo;Whole Church&rdquo;, &ldquo;Youth Group&rdquo;,
        &ldquo;Deacons&rdquo;.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <CreateGroupForm />
      </div>

      <div className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {(groups ?? []).map((g) => (
          <Link
            key={g.id}
            href={`/groups/${g.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <div className="font-medium text-slate-900">{g.name}</div>
              {g.description && (
                <div className="text-sm text-slate-500">{g.description}</div>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {counts.get(g.id) ?? 0} member(s)
            </div>
          </Link>
        ))}
        {(!groups || groups.length === 0) && (
          <div className="px-4 py-6 text-center text-slate-400">
            No groups yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
