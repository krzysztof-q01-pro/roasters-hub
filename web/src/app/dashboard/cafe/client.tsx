"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  addCafeRoasterRelation,
  removeCafeRoasterRelation,
  searchVerifiedRoasters,
} from "@/actions/cafe-relation.actions";
import { UploadButton } from "@/lib/uploadthing";
import { updateCafeCoverImage } from "@/actions/cafe.actions";
import { DeleteAccountSection } from "@/components/shared/DeleteAccountSection";

type Cafe = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  status: string;
  coverImageUrl: string | null;
};

type LinkedRoaster = { id: string; name: string; slug: string; city: string };
type SearchResult = { id: string; name: string; slug: string; city: string; country: string };
type Stats = { pageViews: number; websiteClicks: number; contactClicks: number };

export function CafeDashboardClient({
  cafe,
  linkedRoasters: initialLinked,
  stats,
}: {
  cafe: Cafe;
  linkedRoasters: LinkedRoaster[];
  stats: Stats;
}) {
  const router = useRouter();
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

  const statusColor =
    cafe.status === "VERIFIED"
      ? "text-green-700 bg-green-100"
      : cafe.status === "PENDING"
        ? "text-amber-700 bg-amber-100"
        : "text-red-700 bg-red-100";

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="font-headline text-4xl tracking-tight mb-2">
            {cafe.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${statusColor}`}>
              {cafe.status}
            </span>
            <span className="text-sm text-on-surface-variant/60">
              {cafe.city}, {cafe.country}
            </span>
          </div>
        </div>
        <Link
          href={`/cafes/${cafe.slug}`}
          className="text-xs uppercase tracking-widest font-bold text-primary pb-1 border-b-2 border-primary/20 hover:border-primary transition-all"
        >
          View Public Profile
        </Link>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
        {[
          { label: "Page Views", value: stats.pageViews },
          { label: "Website Clicks", value: stats.websiteClicks },
          { label: "Contact Clicks", value: stats.contactClicks },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest editorial-shadow rounded-xl p-6 border border-outline-variant/10"
          >
            <p className="text-3xl font-bold tracking-tight mb-1">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant/60">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* Message */}
      {message && (
        <div
          className={`mb-8 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {cafe.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-8">
          Your profile is pending review. Changes will be visible after verification.
        </div>
      )}

      {/* Cover Image Section */}
      <section className="bg-surface-container-lowest editorial-shadow rounded-2xl p-8 border border-outline-variant/10 mb-8">
        <h2 className="font-headline text-2xl tracking-tight mb-6">Cover Image</h2>

        {cafe.coverImageUrl && (
          <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden mb-4">
            <Image
              src={cafe.coverImageUrl}
              alt={cafe.name}
              fill
              sizes="(max-width: 1024px) 100vw, 960px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col items-center gap-3 border-2 border-dashed border-outline-variant/30 rounded-xl p-8 bg-surface-container-low">
          <p className="text-on-surface-variant/70 text-sm">
            {cafe.coverImageUrl ? "Replace your cover image" : "Upload a cover image for your cafe profile"}
          </p>
          <UploadButton
            endpoint="roasterImage"
            onClientUploadComplete={async (res) => {
              if (res?.[0]?.url) {
                await updateCafeCoverImage(cafe.id, res[0].url);
                setMessage({ type: "success", text: "Cover image uploaded!" });
                router.refresh();
              }
            }}
            onUploadError={(error: Error) => {
              setMessage({ type: "error", text: error.message });
            }}
            appearance={{
              button: "bg-primary text-on-primary px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors ut-uploading:bg-primary/50",
              allowedContent: "text-on-surface-variant/50 text-xs mt-2",
            }}
          />
        </div>
      </section>

      {/* Roasters we serve */}
      <section className="bg-surface-container-lowest editorial-shadow rounded-2xl p-8 border border-outline-variant/10">
        <h2 className="font-headline text-2xl mb-4">Roasters we serve</h2>

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
      <DeleteAccountSection />
    </main>
  );
}
