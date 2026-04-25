"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const locales = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "pl", label: "PL", flag: "🇵🇱" },
  { code: "de", label: "DE", flag: "🇩🇪" },
];

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  const current = locales.find((l) => l.code === currentLocale) || locales[0];

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown} data-testid="locale-switcher">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("changeLanguage")} — ${t("current")}: ${t(current.code)}`}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium bg-surface-container-high text-on-surface px-4 py-2.5 rounded-xl hover:bg-surface-variant transition-colors"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {current.flag}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-on-surface-variant transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/5 bg-[#1e1e24] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {locales.map((locale) => {
            const isActive = locale.code === currentLocale;
            return (
              <Link
                key={locale.code}
                href={pathname}
                locale={locale.code}
                role="option"
                aria-selected={isActive}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                  <span>{t(locale.code)}</span>
                </span>
                <span
                  className={`text-base leading-none ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                  aria-hidden="true"
                >
                  {locale.flag}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
