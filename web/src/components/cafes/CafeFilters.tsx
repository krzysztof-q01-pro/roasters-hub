"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface CafeFiltersProps {
  countries: { code: string; name: string; count: number }[];
}

export function CafeFilters({ countries }: CafeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/cafes?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/cafes");
  }, [router]);

  const activeCountry = searchParams.get("country");

  const hasActiveFilters =
    !!searchParams.get("country") || !!searchParams.get("q");

  return (
    <aside className="w-full lg:w-[300px] shrink-0">
      <button
        className="lg:hidden w-full flex items-center justify-between py-3 border-b border-outline-variant/20 mb-6"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-headline text-2xl flex items-center gap-2">
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </span>
        <svg
          className={`w-5 h-5 text-on-surface-variant transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 2424"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`space-y-10 ${open ? "block" : "hidden"} lg:block`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-2xl hidden lg:block">Filters</h2>
          <button onClick={clearAll} className="text-sm text-primary hover:underline underline-offset-4">
            Clear all
          </button>
        </div>

        <div>
          <label htmlFor="filter-search" className="text-xs font-semibold uppercase tracking-wider mb-3 block">Search name</label>
          <input
            id="filter-search"
            className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm"
            placeholder="Cafe name..."
            type="text"
            defaultValue={searchParams.get("q") || ""}
            onChange={(e) => updateFilter("q", e.target.value || null)}
          />
        </div>

        <div>
          <label htmlFor="filter-country" className="text-xs font-semibold uppercase tracking-wider mb-3 block">Country</label>
          <select
            id="filter-country"
            className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm"
            value={activeCountry || ""}
            onChange={(e) => updateFilter("country", e.target.value || null)}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}