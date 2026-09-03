import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";
import { formatPhoneForDisplay } from "@/lib/phone";
import AddContactForm from "./AddContactForm";
import ImportForm from "./ImportForm";
import { deleteContact } from "./actions";

export default async function ContactsPage() {
  const { data: contacts } = await supabaseService()
    .from("contacts")
    .select(
      "id, first_name, last_name, phone, email, sms_opt_in, voice_opt_in"
    )
    .order("first_name");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Congregants</h1>
      <p className="text-sm text-slate-500">
        Add people one at a time or paste in a whole list at once.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <AddContactForm />
      </div>

      <div className="mt-4">
        <ImportForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Texts</th>
              <th className="px-4 py-2 font-medium">Calls</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(contacts ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 text-slate-900">
                  {c.first_name} {c.last_name}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {formatPhoneForDisplay(c.phone)}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {c.email ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <Badge ok={c.sms_opt_in} />
                </td>
                <td className="px-4 py-2">
                  <Badge ok={c.voice_opt_in} />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteContact(c.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!contacts || contacts.length === 0) && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-400"
                  colSpan={6}
                >
                  No congregants yet. Add one above to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
      }`}
    >
      {ok ? "Opted in" : "Opted out"}
    </span>
  );
}
