"use client";

import { useActionState, useRef, useState } from "react";
import { importContacts } from "./actions";

export default function ImportForm() {
  const [state, formAction, pending] = useActionState(
    importContacts,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        {open ? "Hide bulk import" : "Bulk import from a spreadsheet"}
      </button>
      {open && (
        <form ref={formRef} action={formAction} className="mt-3 space-y-2">
          <p className="text-sm text-slate-500">
            Paste one congregant per line: <code>First,Last,Phone,Email</code>{" "}
            (email is optional). Copy a column of names/phones straight out of
            Excel or Google Sheets.
          </p>
          <textarea
            name="csv"
            rows={6}
            placeholder={"Jane,Doe,555-123-4567,jane@example.com\nJohn,Smith,555-987-6543"}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {pending ? "Importing..." : "Import"}
          </button>
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state?.imported !== undefined && (
            <p className="text-sm text-green-600">
              Imported {state.imported} congregant(s). Skipped{" "}
              {state.skipped ?? 0} invalid or duplicate row(s).
            </p>
          )}
        </form>
      )}
    </div>
  );
}
