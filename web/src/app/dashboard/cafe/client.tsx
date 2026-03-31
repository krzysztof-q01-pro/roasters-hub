"use client";

import { useState, useTransition } from "react";
import {
  addCafeRoasterRelation,
  removeCafeRoasterRelation,
  searchVerifiedRoasters,
} from "@/actions/cafe-relation.actions";

type Cafe = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  status: string;
};

type LinkedRoaster = { id: string; name: string; slug: string; city: string };
type SearchResult = { id: string; name: string; slug: string; city: string; country: string };

export function CafeDashboardClient({
  cafe,
  linkedRoasters: initialLinked,
}: {
  cafe: Cafe;
  linkedRoasters: LinkedRoaster[];
}) {
  const [isPending, startTransition] = useTransition();
  const [linked, setLinked] = useState(initialLinked);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    const r = await searchVerifiedRoasters(q);
    setResults(r);
  };

  const handleAdd = (roaster: SearchResult) => {
    startTransition(async () => {
      const result = await addCafeRoasterRelation(cafe.id, roaster.id, cafe.slug, roaster.slug);
      if (result.success) {
        setLinked((prev) => [...prev, { id: roaster.id, name: roaster.name, slug: roaster.slug, city: roaster.city }]);
        setMessage({ type: "success", text: `Added ${roaster.name}` });
        setQuery("");
        setResults([]);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handleRemove = (r: LinkedRoaster) => {
    startTransition(async () => {
      const result = await removeCafeRoasterRelation(cafe.id, r.id, cafe.slug, r.slug);
      if (result.success) {
        setLinked((prev) => prev.filter((lr) => lr.id !== r.id));
        setMessage({ type: "success", text: `Removed ${r.name}` });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <div>
        <h1 className="font-headline text-4xl italic tracking-tight mb-1">{cafe.name}</h1>
        <p className="text-on-surface-variant/60">{cafe.city}, {cafe.country}</p>
        <span
          className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            cafe.status === "VERIFIED"
              ? "bg-green-100 text-green-800"
              : cafe.status === "PENDING"
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {cafe.status}
        </span>
      </div>

      {cafe.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Your profile is pending review. Changes will be visible after verification.
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-error"}`}>
          {message.text}
        </p>
      )}

      <section>
        <h2 className="font-headline text-2xl italic mb-4">Roasters we serve</h2>

        {linked.length > 0 && (
          <div className="space-y-2 mb-5">
            {linked.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-on-surface-variant/60">{r.city}</p>
                </div>
                <button
                  onClick={() => handleRemove(r)}
                  disabled={isPending}
                  className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search roasters by name…"
            className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline/20 rounded-xl shadow-lg z-10 overflow-hidden">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleAdd(r)}
                  disabled={isPending || linked.some((lr) => lr.id === r.id)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors text-sm disabled:opacity-40"
                >
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-on-surface-variant/60">
                    {r.city}, {r.country}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
