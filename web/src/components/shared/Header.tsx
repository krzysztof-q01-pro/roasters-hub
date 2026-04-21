"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { CoffeeBean } from "@/components/icons/CoffeeBean";
import { CoffeeCup } from "@/components/icons/CoffeeCup";
import { AddPlaceDropdown } from "./AddPlaceDropdown";

function HeaderSearch() {
  const t = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") || "";
  const [entityType, setEntityType] = useState<"roasters" | "cafes">(() => {
    if (typeof window === "undefined") return "cafes";
    const stored = localStorage.getItem("beanmap_entity_type");
    return stored === "roasters" || stored === "cafes" ? stored : "cafes";
  });

  const handleToggle = (type: "roasters" | "cafes") => {
    setEntityType(type);
    localStorage.setItem("beanmap_entity_type", type);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value.trim();
      const base = entityType === "cafes" ? "/cafes" : "/roasters";
      router.push(val ? `${base}?q=${encodeURIComponent(val)}` : base);
    }
  };

  return (
    <div className="hidden sm:flex items-center bg-surface-container-low rounded-lg overflow-hidden h-[42px] border-[1.5px] border-transparent focus-within:border-outline-variant/50 transition-colors">
      <button
        onClick={() => handleToggle("roasters")}
        className={`h-full px-3 flex items-center transition-colors ${
          entityType === "roasters"
            ? "bg-primary text-on-primary"
            : "text-outline hover:bg-surface-container-high"
        }`}
        aria-label={t("searchRoastersLabel")}
        aria-pressed={entityType === "roasters"}
      >
        <CoffeeBean className="w-[17px] h-[17px]" />
      </button>
      <div className="w-px h-[55%] bg-outline-variant/30" />
      <button
        onClick={() => handleToggle("cafes")}
        className={`h-full px-3 flex items-center transition-colors ${
          entityType === "cafes"
            ? "bg-secondary text-on-secondary"
            : "text-outline hover:bg-surface-container-high"
        }`}
        aria-label={t("searchCafesLabel")}
        aria-pressed={entityType === "cafes"}
      >
        <CoffeeCup className="w-[17px] h-[17px]" />
      </button>
      <div className="flex items-center px-3 gap-2 flex-1">
        <svg className="w-[14px] h-[14px] text-on-surface-variant/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth={2} strokeLinecap="round" />
          <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <input
          key={currentQ}
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-44 lg:w-64 placeholder:text-on-surface-variant/40"
          placeholder={entityType === "cafes" ? t("searchCafesPlaceholder") : t("searchRoastersPlaceholder")}
          type="text"
          defaultValue={currentQ}
          onKeyDown={handleSearch}
        />
      </div>
    </div>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/roasters", label: t("browseRoasters") },
    { href: "/cafes", label: t("browseCafes") },
    { href: "/map", label: t("map") },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-surface-container-high/50">
      <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-[66px]">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label={t("homeLabel")} className="flex items-center">
            <Image
              src="/brand/beanmap-logo.png"
              alt="Bean Map"
              width={102}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "text-primary font-bold border-b-2 border-primary pb-1 text-base tracking-tight"
                      : "text-on-surface-variant hover:text-on-surface transition-colors text-base font-bold tracking-tight"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            <AddPlaceDropdown />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={
            <div className="hidden sm:flex items-center bg-surface-container-low rounded-lg overflow-hidden h-[42px] w-72 lg:w-80" />
          }>
            <HeaderSearch />
          </Suspense>

          <button
            className="md:hidden text-on-surface-variant"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
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

      {mobileOpen && (
        <nav className="md:hidden border-t border-surface-container-high/50 bg-white px-6 py-4 space-y-3" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-on-surface-variant hover:text-primary transition-colors py-2 text-base font-bold"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-surface-container-high/30 space-y-1">
            <Link
              href="/register"
              className="block text-on-surface-variant hover:text-primary transition-colors py-2 text-base font-bold"
              onClick={() => setMobileOpen(false)}
            >
              {t("registerRoastery")}
            </Link>
            <Link
              href="/register/cafe"
              className="block text-on-surface-variant hover:text-primary transition-colors py-2 text-base font-bold"
              onClick={() => setMobileOpen(false)}
            >
              {t("registerCafe")}
            </Link>
            <Link
              href="/suggest/roastery"
              className="block text-on-surface-variant hover:text-primary transition-colors py-2 text-base font-bold"
              onClick={() => setMobileOpen(false)}
            >
              {t("suggestRoastery")}
            </Link>
            <Link
              href="/suggest/cafe"
              className="block text-on-surface-variant hover:text-primary transition-colors py-2 text-base font-bold"
              onClick={() => setMobileOpen(false)}
            >
              {t("suggestCafe")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
