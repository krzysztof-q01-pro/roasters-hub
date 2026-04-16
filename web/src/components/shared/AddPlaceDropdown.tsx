"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function AddPlaceDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
      >
        Dodaj miejsce
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#111] p-2 shadow-xl"
        >
          <a
            role="menuitem"
            href="/register"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors focus:bg-white/5 focus:outline-none"
          >
            <div className="font-medium text-gray-100">Mam palarnię</div>
            <div className="text-xs text-gray-500">Zarejestruj swoją palarnię</div>
          </a>
          <a
            role="menuitem"
            href="/register/cafe"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors focus:bg-white/5 focus:outline-none"
          >
            <div className="font-medium text-gray-100">Mam kawiarnię</div>
            <div className="text-xs text-gray-500">Zarejestruj swoją kawiarnię</div>
          </a>
          <div className="my-1 border-t border-white/10" />
          <a
            role="menuitem"
            href="/suggest/roastery"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors focus:bg-white/5 focus:outline-none"
          >
            <div className="font-medium text-gray-100">Znam świetną palarnię</div>
            <div className="text-xs text-gray-500">Zaproponuj miejsce</div>
          </a>
          <a
            role="menuitem"
            href="/suggest/cafe"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors focus:bg-white/5 focus:outline-none"
          >
            <div className="font-medium text-gray-100">Znam świetną kawiarnię</div>
            <div className="text-xs text-gray-500">Zaproponuj miejsce</div>
          </a>
        </div>
      )}
    </div>
  );
}
