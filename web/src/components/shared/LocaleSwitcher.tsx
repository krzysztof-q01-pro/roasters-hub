"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("changeLanguage")} — ${t("current")}: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold bg-surface-container text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-36 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-1.5 shadow-[var(--shadow-dropdown)]"
        >
          {locales.map((locale) => (
            <Link
              key={locale.code}
              href={pathname}
              locale={locale.code}
              role="option"
              aria-selected={locale.code === currentLocale}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                locale.code === currentLocale
                  ? "bg-surface-container-low font-semibold pointer-events-none"
                  : "hover:bg-surface-container-low"
              }`}
            >
              <span className="text-base leading-none">{locale.flag}</span>
              <span>{locale.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
