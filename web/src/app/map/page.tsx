"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/shared/Header";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import { MOCK_ROASTERS } from "@/lib/mock-data";

const RoasterMap = dynamic(
  () => import("@/components/roasters/RoasterMap").then((mod) => mod.RoasterMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-surface-container-low animate-pulse" /> }
);

export default function MapPage() {
  const verifiedRoasters = MOCK_ROASTERS.filter(
    (r) => r.status === "VERIFIED" && r.lat && r.lng
  );

  const mapData = verifiedRoasters.map((r) => ({
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
      <main className="flex-1 flex overflow-hidden">
        {/* Map Area */}
        <section className="relative w-full lg:w-[70%] h-full">
          <RoasterMap roasters={mapData} />
        </section>

        {/* Sidebar */}
        <aside className="hidden lg:flex w-[30%] h-full bg-surface-container flex-col border-l border-outline-variant/10">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-2xl font-black font-headline text-on-surface leading-none">
                {verifiedRoasters.length} beans
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                All Roasters
              </span>
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
            {verifiedRoasters.map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} variant="compact" />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
