import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";
import { updateContact, deleteContact } from "../actions";

export default async function EditContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const { data: contact } = await supabaseService()
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (!contact) notFound();

  const update = updateContact.bind(null, id);
  const remove = async () => {
    "use server";
    await deleteContact(id);
    const { redirect } = await import("next/navigation");
    redirect("/contacts");
  };

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Edit congregant
      </h1>

      <form action={update} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              name="first_name"
              defaultValue={contact.first_name}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              name="last_name"
              defaultValue={contact.last_name}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            name="phone"
            defaultValue={contact.phone}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={contact.email ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            name="notes"
            defaultValue={contact.notes ?? ""}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="sms_opt_in"
              defaultChecked={contact.sms_opt_in}
            />
            Can receive texts
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="voice_opt_in"
              defaultChecked={contact.voice_opt_in}
            />
            Can receive calls
          </label>
        </div>
        {error && (
          <p className="text-sm text-red-600">
            Please provide a valid name and phone number.
          </p>
        )}
        <div className="pt-2">
          <button
            type="submit"
            className="rounded-md bg-[#0b2a4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2440]"
          >
            Save changes
          </button>
        </div>
      </form>
      <form action={remove} className="mt-4">
        <button
          type="submit"
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete congregant
        </button>
      </form>
    </div>
  );
}
