"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function AddPlaceDropdown() {
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

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold bg-surface-container text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
      >
        + Add place
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2 shadow-[var(--shadow-dropdown)]"
        >
          <a
            role="menuitem"
            href="/register"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-container-low transition-colors focus:bg-surface-container-low focus:outline-none"
          >
            <div className="font-semibold text-on-surface">I have a roastery</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Register your roastery</div>
          </a>
          <a
            role="menuitem"
            href="/register/cafe"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-container-low transition-colors focus:bg-surface-container-low focus:outline-none"
          >
            <div className="font-semibold text-on-surface">I have a café</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Register your café</div>
          </a>
          <div className="my-1 border-t border-outline-variant/30" />
          <a
            role="menuitem"
            href="/suggest/roastery"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-container-low transition-colors focus:bg-surface-container-low focus:outline-none"
          >
            <div className="font-semibold text-on-surface">Know a great roastery</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Suggest a place</div>
          </a>
          <a
            role="menuitem"
            href="/suggest/cafe"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface-container-low transition-colors focus:bg-surface-container-low focus:outline-none"
          >
            <div className="font-semibold text-on-surface">Know a great café</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Suggest a place</div>
          </a>
        </div>
      )}
    </div>
  );
}
