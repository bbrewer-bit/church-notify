import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";
import { formatPhoneForDisplay } from "@/lib/phone";
import { deleteGroup, updateGroupDetails, setGroupMembers } from "../actions";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = supabaseService();

  const [{ data: group }, { data: allContacts }, { data: members }] =
    await Promise.all([
      supabase.from("groups").select("*").eq("id", id).single(),
      supabase
        .from("contacts")
        .select("id, first_name, last_name, phone")
        .order("first_name"),
      supabase.from("group_members").select("contact_id").eq("group_id", id),
    ]);

  if (!group) notFound();

  const memberIds = new Set((members ?? []).map((m) => m.contact_id));

  const updateDetails = updateGroupDetails.bind(null, id);
  const saveMembers = setGroupMembers.bind(null, id);
  const remove = deleteGroup.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{group.name}</h1>

      <form action={updateDetails} className="mt-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            name="name"
            defaultValue={group.name}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <input
            name="description"
            defaultValue={group.description ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save details
        </button>
      </form>

      <form action={saveMembers} className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Members</h2>
        <p className="text-sm text-slate-500">
          Check everyone who belongs in this group.
        </p>
        <div className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {(allContacts ?? []).map((c) => (
            <label
              key={c.id}
              className="flex items-center justify-between gap-4 px-4 py-2 text-sm hover:bg-slate-50"
            >
              <span className="text-slate-900">
                {c.first_name} {c.last_name}{" "}
                <span className="text-slate-400">
                  {formatPhoneForDisplay(c.phone)}
                </span>
              </span>
              <input
                type="checkbox"
                name="contact_ids"
                value={c.id}
                defaultChecked={memberIds.has(c.id)}
              />
            </label>
          ))}
          {(!allContacts || allContacts.length === 0) && (
            <div className="px-4 py-6 text-center text-slate-400">
              Add some congregants first.
            </div>
          )}
        </div>
        <button
          type="submit"
          className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save members
        </button>
      </form>

      <form action={remove} className="mt-8">
        <button
          type="submit"
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete group
        </button>
      </form>
    </div>
  );
}
