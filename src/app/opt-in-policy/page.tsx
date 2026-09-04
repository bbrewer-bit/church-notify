import Image from "next/image";

export const metadata = {
  title: "Opt-In & Messaging Policy — Spruce Pine Grove Notify",
};

export default function OptInPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-14">
      <div className="flex items-center gap-4 border-b-2 border-[#0b2a4d] pb-6">
        <Image
          src="/icons/icon-192.png"
          alt="Spruce Pine Grove Missionary Baptist Church logo"
          width={56}
          height={56}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-lg font-semibold text-[#0b2a4d]">
            Spruce Pine Grove Missionary Baptist Church
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            1409 Tennessee 31, Mooresburg, TN &middot; (833) 681-3555
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Opt-In &amp; Messaging Policy
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900 text-balance">
          Text &amp; Phone Announcement Consent
        </h2>
        <p className="mt-1 text-sm text-slate-500">Effective September 2026</p>
      </div>

      <section className="mt-9">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-[#0b2a4d]">
          <span className="text-sm font-semibold text-slate-400">01</span>
          How People Join Our List
        </h3>
        <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-slate-800">
          Congregants and visitors are added to Spruce Pine Grove Missionary
          Baptist Church&rsquo;s text and phone announcement list only after
          giving their name and mobile number directly to the church office or
          pastoral staff &mdash; in person, by phone, or on a paper
          communication card completed at a worship service or church event.
          At that time, each person expressly agrees to receive text and/or
          automated phone call announcements from the church.
        </p>
        <p className="mt-2 max-w-prose text-sm text-slate-500">
          No number is added from a purchased, rented, or third-party list,
          and no one is signed up on someone else&rsquo;s behalf.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-[#0b2a4d]">
          <span className="text-sm font-semibold text-slate-400">02</span>
          What We Send
        </h3>
        <ul className="mt-2 max-w-prose list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-800">
          <li>Worship service reminders and schedule changes</li>
          <li>Weather-related cancellations and closures</li>
          <li>
            Church event announcements (revivals, socials, mission trips, and
            similar gatherings)
          </li>
          <li>Occasional pastoral or congregational care messages</li>
        </ul>
        <p className="mt-2 max-w-prose text-sm text-slate-500">
          Message frequency varies and is announcement-driven &mdash;
          typically a handful of messages per month, not a fixed schedule.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-[#0b2a4d]">
          <span className="text-sm font-semibold text-slate-400">03</span>
          Cost
        </h3>
        <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-slate-800">
          Message and data rates may apply, per the recipient&rsquo;s own
          mobile carrier plan. Spruce Pine Grove Missionary Baptist Church
          does not charge for these announcements.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-[#0b2a4d]">
          <span className="text-sm font-semibold text-slate-400">04</span>
          How to Opt Out
        </h3>
        <ul className="mt-2 max-w-prose list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-800">
          <li>
            <strong>By text:</strong> reply <strong>STOP</strong> to any
            message at any time to stop receiving texts. Reply{" "}
            <strong>START</strong> to resume.
          </li>
          <li>
            <strong>By phone:</strong> press <strong>9</strong> during any
            automated call to be removed from future calls.
          </li>
          <li>
            <strong>In person:</strong> contact the church office directly and
            ask to be removed.
          </li>
        </ul>
        <p className="mt-2 max-w-prose text-sm text-slate-500">
          Opt-out requests are processed immediately in our system.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-[#0b2a4d]">
          <span className="text-sm font-semibold text-slate-400">05</span>
          Questions or Concerns
        </h3>
        <div className="mt-2 max-w-prose rounded-lg border border-slate-200 bg-white p-5">
          <p className="font-semibold text-[#0b2a4d]">
            Spruce Pine Grove Missionary Baptist Church
          </p>
          <p className="mt-1 text-sm text-slate-500">
            1409 Tennessee 31, Mooresburg, TN
          </p>
          <p className="text-sm text-slate-500">(833) 681-3555</p>
        </div>
      </section>

      <footer className="mt-12 max-w-prose border-t border-slate-200 pt-5 text-sm text-slate-400">
        This page documents Spruce Pine Grove Missionary Baptist Church&rsquo;s
        opt-in consent process and messaging practices for its text and
        automated phone announcement system, for reference by mobile carriers
        and messaging platform reviewers.
      </footer>
    </div>
  );
}
