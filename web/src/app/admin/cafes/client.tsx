"use client";

import { useState } from "react";
import { verifyCafe, rejectCafe } from "@/actions/cafe.actions";

type Cafe = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
  owner: { email: string } | null;
};

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  VERIFIED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function AdminCafesClient({ cafes }: { cafes: Cafe[] }) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleVerify = async (id: string) => {
    setProcessing(id);
    await verifyCafe(id);
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setProcessing(id);
    await rejectCafe(id, rejectReason);
    setRejectingId(null);
    setRejectReason("");
    setProcessing(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-headline text-3xl italic mb-8">Cafe Applications</h1>
      <div className="space-y-4">
        {cafes.length === 0 && (
          <p className="text-center text-on-surface-variant/60 py-16">No cafe applications.</p>
        )}
        {cafes.map((cafe) => (
          <div key={cafe.id} className="bg-surface-container rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{cafe.name}</p>
                <p className="text-sm text-on-surface-variant/60">
                  {cafe.city}, {cafe.country}
                </p>
                {cafe.owner && (
                  <p className="text-xs text-on-surface-variant/40 mt-1">{cafe.owner.email}</p>
                )}
                <p className="text-xs text-on-surface-variant/40">
                  {new Date(cafe.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[cafe.status]}`}
                >
                  {cafe.status}
                </span>
                {cafe.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleVerify(cafe.id)}
                      disabled={processing === cafe.id}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setRejectingId(cafe.id)}
                      className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
            {rejectingId === cafe.id && (
              <div className="mt-4 flex gap-3">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason…"
                  className="flex-1 border border-outline/30 rounded-lg px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => handleReject(cafe.id)}
                  disabled={!rejectReason.trim() || processing === cafe.id}
                  className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  className="text-sm text-on-surface-variant/60"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
