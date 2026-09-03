import Link from "next/link";
import { logout } from "@/app/login/actions";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/contacts", label: "Contacts" },
  { href: "/groups", label: "Groups" },
  { href: "/history", label: "History" },
];

export default function NavBar({ name }: { name?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">Church Notify</span>
          <nav className="hidden gap-4 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout} className="flex items-center gap-3">
          {name && <span className="text-sm text-slate-500">{name}</span>}
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Sign out
          </button>
        </form>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap text-sm text-slate-600 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
