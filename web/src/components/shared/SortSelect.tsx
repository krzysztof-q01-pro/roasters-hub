"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SortOption {
  label: string;
  value: string;
}

export function SortSelect({ options, basePath }: { options: SortOption[]; basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || options[0]?.value;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === options[0]?.value) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  }

  return (
    <select
      className={`bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-primary ${isPending ? "opacity-60" : ""}`}
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}