"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/icons/icon-192.png"
            alt="Spruce Pine Grove Baptist Church logo"
            width={72}
            height={72}
            className="rounded-xl"
          />
          <h1 className="mt-3 text-xl font-semibold text-[#0b2a4d]">
            Spruce Pine Grove Notify
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to send text and phone announcements.
          </p>
        </div>
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            name="name"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#0b2a4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0a2440] disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
