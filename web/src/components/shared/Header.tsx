"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/roasters", label: "Browse Roasters" },
  { href: "/map", label: "Map" },
  { href: "/register", label: "List Your Roastery", accent: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value.trim();
      router.push(val ? `/roasters?q=${encodeURIComponent(val)}` : "/roasters");
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-surface-container-high/50">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-bold font-headline text-on-background tracking-tighter"
          >
            Bean Map
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "text-primary font-semibold border-b-2 border-primary pb-1 text-sm font-headline italic tracking-tight"
                      : link.accent
                        ? "text-primary hover:text-primary-container transition-colors text-sm font-headline italic tracking-tight"
                        : "text-on-surface-variant hover:text-on-surface transition-colors text-sm font-headline italic tracking-tight"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 text-on-surface-variant/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              key={currentQ}
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-32 lg:w-48 placeholder:text-on-surface-variant/60"
              placeholder="Find a roaster..."
              type="text"
              defaultValue={currentQ}
              onKeyDown={handleSearch}
            />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-on-surface-variant"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-surface-container-high/50 bg-white px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-on-surface-variant hover:text-primary transition-colors py-2 font-headline italic"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
