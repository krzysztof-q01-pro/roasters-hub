"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Add some pending roasters for demo
type RoasterStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface AdminRoaster {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  status: RoasterStatus;
  featured: boolean;
  description: string;
  certifications: string[];
  origins: string[];
  website: string | null;
  email: string | null;
  instagram: string | null;
  createdAt: Date;
  images: { url: string; alt: string | null }[];
}

const PENDING_ROASTERS: AdminRoaster[] = [
  {
    id: "pending-1",
    name: "New Roaster Alpha",
    slug: "new-roaster-alpha",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    status: "PENDING",
    featured: false,
    description: "A Berlin-based micro-roastery specializing in single origin Ethiopian and Kenyan coffees.",
    certifications: ["ORGANIC", "DIRECT_TRADE"],
    origins: ["Ethiopia", "Kenya"],
    website: "https://newroasteralpha.de",
    email: "hello@newroasteralpha.de",
    instagram: "newroasteralpha",
    createdAt: new Date("2026-03-19"),
    images: [{ url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", alt: "Roastery" }],
  },
  {
    id: "pending-2",
    name: "Craft Beans Co",
    slug: "craft-beans-co",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    status: "PENDING",
    featured: false,
    description: "Sustainable specialty roaster focused on direct trade relationships with Colombian farmers.",
    certifications: ["FAIR_TRADE", "DIRECT_TRADE"],
    origins: ["Colombia", "Brazil"],
    website: "https://craftbeans.nl",
    email: "info@craftbeans.nl",
    instagram: "craftbeansco",
    createdAt: new Date("2026-03-20"),
    images: [{ url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop", alt: "Coffee beans" }],
  },
  {
    id: "pending-3",
    name: "Morning Glory Roasters",
    slug: "morning-glory-roasters",
    city: "Portland",
    country: "United States",
    countryCode: "US",
    status: "PENDING",
    featured: false,
    description: "Pacific Northwest roaster offering experimental processing methods and bold flavor profiles.",
    certifications: ["DIRECT_TRADE", "SCA_MEMBER"],
    origins: ["Ethiopia", "Guatemala", "Honduras"],
    website: "https://morninggloryroasters.com",
    email: "hello@morninggloryroasters.com",
    instagram: "morninggloryroasters",
    createdAt: new Date("2026-03-21"),
    images: [{ url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&h=300&fit=crop", alt: "Coffee roasting" }],
  },
];

type StatusFilter = "all" | "PENDING" | "VERIFIED" | "REJECTED";

export default function AdminPendingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(PENDING_ROASTERS[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [roasters, setRoasters] = useState(PENDING_ROASTERS);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const filteredRoasters = statusFilter === "all"
    ? roasters
    : roasters.filter((r) => r.status === statusFilter);

  const selected = roasters.find((r) => r.id === selectedId);

  const handleVerify = (id: string) => {
    setRoasters((prev) =>
      prev.map((r): AdminRoaster => (r.id === id ? { ...r, status: "VERIFIED" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRoasters((prev) =>
      prev.map((r): AdminRoaster => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
    setShowRejectModal(false);
    setRejectReason("");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">Pending</span>;
      case "VERIFIED": return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase">Verified</span>;
      case "REJECTED": return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full uppercase">Rejected</span>;
      default: return null;
    }
  };

  const [now] = useState(() => Date.now());

  const timeAgo = (date: Date) => {
    const diff = now - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="bg-white border-b border-surface-container-high px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold font-headline tracking-tighter">Bean Map</span>
            <span className="text-xs bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded font-bold uppercase">Admin</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <span className="text-primary font-semibold">
              Pending ({roasters.filter((r) => r.status === "PENDING").length})
            </span>
            <span className="text-on-surface-variant">All Roasters</span>
            <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              View Site
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main 2-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Queue */}
        <div className="w-[400px] border-r border-surface-container-high flex flex-col bg-white">
          <div className="p-4 border-b border-surface-container-high">
            <h2 className="font-headline text-xl font-bold mb-3">Pending Verification</h2>
            <div className="flex gap-2">
              {(["all", "PENDING", "VERIFIED", "REJECTED"] as StatusFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={
                    statusFilter === filter
                      ? "px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold"
                      : "px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-colors"
                  }
                >
                  {filter === "all" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRoasters.map((roaster) => (
              <button
                key={roaster.id}
                onClick={() => setSelectedId(roaster.id)}
                className={`w-full text-left p-4 border-b border-surface-container-low hover:bg-surface-container-low transition-colors ${
                  selectedId === roaster.id ? "bg-surface-container-low" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden shrink-0 relative">
                    {roaster.images[0] && (
                      <Image src={roaster.images[0].url} alt="" fill className="object-cover" sizes="40px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm truncate">{roaster.name}</h3>
                      {statusBadge(roaster.status)}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{roaster.city}, {roaster.country}</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">{timeAgo(roaster.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel — Detail */}
        <div className="flex-1 overflow-y-auto p-8">
          {selected ? (
            <div className="max-w-2xl">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="font-headline text-3xl font-bold">{selected.name}</h2>
                  <p className="text-on-surface-variant">{selected.city}, {selected.country}</p>
                </div>
                {statusBadge(selected.status)}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Description</h3>
                  <p className="text-on-surface-variant leading-relaxed">{selected.description}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.certifications.map((c) => (
                      <span key={c} className="bg-surface-container-high px-3 py-1 rounded-full text-sm">{c}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Origins</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.origins.map((o) => (
                      <span key={o} className="bg-surface-container-high px-3 py-1 rounded-full text-sm">{o}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Links</h3>
                  <div className="space-y-2 text-sm">
                    {selected.website && <p>Website: <a href={selected.website} className="text-primary hover:underline">{selected.website}</a></p>}
                    {selected.email && <p>Email: {selected.email}</p>}
                    {selected.instagram && <p>Instagram: @{selected.instagram}</p>}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Admin Notes</h3>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm resize-none"
                    rows={3}
                    placeholder="Add a note about this roaster..."
                  />
                </div>

                {/* Actions */}
                {selected.status === "PENDING" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleVerify(selected.id)}
                      className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Verify & Publish
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="border border-error text-error px-6 py-3 rounded-lg font-medium hover:bg-error/5 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-on-surface-variant/60">
              Select a roaster from the queue
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="font-headline text-xl font-bold mb-4">Reason for rejection</h3>
            <textarea
              className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm resize-none mb-6"
              rows={4}
              placeholder="Please provide a brief reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
              <button onClick={() => handleReject(selected.id)} className="bg-error text-on-error px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all">
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
