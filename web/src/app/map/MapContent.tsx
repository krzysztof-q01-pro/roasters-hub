"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import type { Roaster, RoasterImage } from "@prisma/client";

const RoasterMap = dynamic(
  () => import("@/components/roasters/RoasterMap").then((mod) => mod.RoasterMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-surface-container-low animate-pulse" /> }
);

type RoasterWithImages = Roaster & { images: RoasterImage[] };

export function MapContent({ roasters }: { roasters: RoasterWithImages[] }) {
  const [showSidebar, setShowSidebar] = useState(false);

  const mapData = roasters.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    country: r.country,
    lat: r.lat!,
    lng: r.lng!,
    image: r.images[0]?.url,
    verified: r.status === "VERIFIED",
  }));

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden relative">
        {/* Map Area */}
        <section className="relative w-full lg:w-[70%] h-full">
          <RoasterMap roasters={mapData} />

          {/* Mobile toggle button */}
          <button
            className="lg:hidden absolute bottom-6 right-4 z-[500] flex items-center gap-2 bg-primary text-on-primary rounded-full px-4 py-2.5 shadow-lg text-sm font-semibold"
            onClick={() => setShowSidebar(true)}
            aria-label="Show roasters list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {roasters.length} roasters
          </button>
        </section>

        {/* Sidebar — desktop: static, mobile: drawer overlay */}
        {/* Backdrop */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 z-[600] bg-black/40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <aside
          className={[
            "bg-surface-container flex flex-col border-l border-outline-variant/10",
            // Desktop: always visible, static
            "lg:relative lg:flex lg:w-[30%] lg:h-full lg:translate-x-0",
            // Mobile: fixed drawer sliding from right
            "fixed inset-y-0 right-0 z-[700] w-[85vw] max-w-sm h-full transition-transform duration-300",
            showSidebar ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-2xl font-black font-headline text-on-surface leading-none">
                {roasters.length} beans
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                  All Roasters
                </span>
                <button
                  className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => setShowSidebar(false)}
                  aria-label="Close list"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold">ALL</span>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold hover:bg-surface-variant cursor-pointer transition-colors">
                DIRECT TRADE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold hover:bg-surface-variant cursor-pointer transition-colors">
                ORGANIC
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {roasters.map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} variant="compact" />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
