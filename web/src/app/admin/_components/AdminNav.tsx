import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export async function AdminNav() {
  const user = await currentUser();
  const name = user?.firstName ?? "Admin";

  return (
    <nav className="flex h-11 items-center gap-6 bg-stone-900 px-4 text-sm">
      <span className="font-bold tracking-wide text-white">Roasters Hub</span>
      <NavLink href="/admin/enrichment">Enrichment</NavLink>
      <NavLink href="/admin/cafes">Kawiarnie</NavLink>
      <NavLink href="/admin/roasters">Palarnie</NavLink>
      <NavLink href="/admin/users">Użytkownicy</NavLink>
      <span className="ml-auto text-xs text-stone-400">@{name} ↓</span>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-stone-400 hover:text-stone-100 transition-colors"
    >
      {children}
    </Link>
  );
}
