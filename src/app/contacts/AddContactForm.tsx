"use client";

import { useActionState, useRef, useEffect } from "react";
import { createContact } from "./actions";

export default function AddContactForm() {
  const [state, formAction, pending] = useActionState(createContact, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <input
        name="first_name"
        placeholder="First name"
        required
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="last_name"
        placeholder="Last name"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="phone"
        placeholder="Phone e.g. (555) 123-4567"
        required
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="email"
        placeholder="Email (optional)"
        type="email"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[#0b2a4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2440] disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add congregant"}
      </button>
      {state?.error && (
        <p className="col-span-full text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="col-span-full text-sm text-green-600">
          {state.success}
        </p>
      )}
    </form>
  );
}
