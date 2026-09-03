"use client";

import { useActionState, useRef, useEffect } from "react";
import { createGroup } from "./actions";

export default function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input
        name="name"
        placeholder="Group name, e.g. Youth Group"
        required
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="description"
        placeholder="Description (optional)"
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[#0b2a4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2440] disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create group"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600 sm:self-center">{state.error}</p>
      )}
    </form>
  );
}
