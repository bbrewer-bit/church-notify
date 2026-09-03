"use client";

import { useActionState, useMemo, useState } from "react";
import { sendBlast } from "./actions";

type Audience = {
  id: string;
  label: string;
  smsCount: number;
  voiceCount: number;
};

export default function SendForm({ audiences }: { audiences: Audience[] }) {
  const [state, formAction, pending] = useActionState(sendBlast, undefined);
  const [audienceId, setAudienceId] = useState(audiences[0]?.id ?? "all");
  const [channel, setChannel] = useState<"sms" | "voice" | "both">("sms");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const selected = useMemo(
    () => audiences.find((a) => a.id === audienceId),
    [audiences, audienceId]
  );

  const smsSegments = Math.ceil((message.length || 1) / 160);

  const willReach =
    channel === "both"
      ? Math.max(selected?.smsCount ?? 0, selected?.voiceCount ?? 0)
      : channel === "sms"
      ? selected?.smsCount ?? 0
      : selected?.voiceCount ?? 0;

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Send to
        </label>
        <select
          name="audience_id"
          value={audienceId}
          onChange={(e) => setAudienceId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {audiences.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          How
        </label>
        <div className="mt-1 flex gap-4 text-sm">
          {(
            [
              ["sms", "Text message"],
              ["voice", "Phone call"],
              ["both", "Both"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="channel"
                value={value}
                checked={channel === value}
                onChange={() => setChannel(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          placeholder="e.g. Tonight's service is cancelled due to weather. Stay safe!"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-400">
          {message.length} characters
          {(channel === "sms" || channel === "both") &&
            ` · ${smsSegments} text segment${smsSegments > 1 ? "s" : ""}`}
          {(channel === "voice" || channel === "both") &&
            " · read aloud on phone calls"}
        </p>
      </div>

      <div className="rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
        This will reach approximately <strong>{willReach}</strong> people who
        are opted in.
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="confirm"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5"
        />
        I&apos;ve reviewed this message and want to send it now to the audience
        above.
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">
          Sent to {state.success.recipientCount} people — {state.success.sent}{" "}
          succeeded, {state.success.failed} failed. Check History for
          details.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !confirmed}
        className="w-full rounded-md bg-[#0b2a4d] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0a2440] disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Sending..." : "Send now"}
      </button>
    </form>
  );
}
