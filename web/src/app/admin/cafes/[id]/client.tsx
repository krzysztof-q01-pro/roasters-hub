"use client";

import { useState, useTransition } from "react";
import { verifyCafe, rejectCafe, adminUpdateCafe } from "@/actions/cafe.actions";

type Proposal = {
  changeType: string;
  fieldKey: string;
  currentValue: string | null;
  proposedValue: string;
  confidence: number;
  status: string;
  createdAt: string;
};

type Cafe = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  status: string;
  description: string | null;
  address: string | null;
  website: string | null;
  email: string | null;
  instagram: string | null;
  phone: string | null;
  priceRange: string | null;
  seatingCapacity: number | null;
  serving: string[];
  services: string[];
  coverImageUrl: string | null;
  logoUrl: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { email: string } | null;
  proposals: Proposal[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  VERIFIED: "bg-secondary-container text-on-secondary-container",
  REJECTED: "bg-error-container text-on-error-container",
};

function Chip({ label }: { label: string }) {
  return <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container text-xs font-medium">{label}</span>;
}

export function AdminCafeDetailClient({ cafe }: { cafe: Cafe }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [form, setForm] = useState({
    name: cafe.name,
    city: cafe.city,
    country: cafe.country,
    address: cafe.address ?? "",
    description: cafe.description ?? "",
    website: cafe.website ?? "",
    email: cafe.email ?? "",
    instagram: cafe.instagram ?? "",
    phone: cafe.phone ?? "",
    priceRange: cafe.priceRange ?? "",
    seatingCapacity: cafe.seatingCapacity?.toString() ?? "",
  });

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyCafe(cafe.id);
      if (!result.success) setError(result.error ?? "Something went wrong");
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await rejectCafe(cafe.id, rejectReason);
      if (!result.success) setError(result.error ?? "Something went wrong");
      else setShowRejectModal(false);
    });
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await adminUpdateCafe(cafe.id, {
        name: form.name || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        address: form.address || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
        email: form.email || undefined,
        instagram: form.instagram || undefined,
        phone: form.phone || undefined,
        priceRange: form.priceRange || undefined,
        seatingCapacity: form.seatingCapacity ? parseInt(form.seatingCapacity, 10) || null : null,
      });
      if (!result.success) setError(result.error ?? "Something went wrong");
      else setMode("view");
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="font-headline text-3xl font-bold text-on-background mb-1">{cafe.name}</h1>
          <p className="text-on-surface-variant">{cafe.city}, {cafe.country}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[cafe.status] ?? ""}`}>{cafe.status}</span>
          {mode === "view" ? (
            <button
              onClick={() => setMode("edit")}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors"
            >
              Edit Details
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setMode("view")}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-sm font-bold hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
          {cafe.status === "PENDING" && mode === "view" && (
            <>
              <button
                onClick={handleVerify}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-secondary-container text-on-secondary-container text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isPending ? "…" : "Verify"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg border border-error text-error text-sm font-bold hover:bg-error/5 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {/* View Mode */}
      {mode === "view" && (
        <div className="space-y-8">
          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Basic Info</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ["Name", cafe.name],
                ["City", cafe.city],
                ["Country", cafe.country],
                ["Address", cafe.address],
                ["Website", cafe.website],
                ["Email", cafe.email],
                ["Instagram", cafe.instagram],
                ["Phone", cafe.phone],
                ["Price Range", cafe.priceRange],
                ["Seating Capacity", cafe.seatingCapacity?.toString()],
              ].map(([label, value]) => value ? (
                <div key={label}>
                  <dt className="text-on-surface-variant/70 text-xs mb-0.5">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ) : null)}
            </dl>
          </section>

          {(cafe.description || cafe.serving.length > 0 || cafe.services.length > 0) && (
            <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
              <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Profile</h2>
              {cafe.description && <p className="text-sm mb-4 text-on-surface">{cafe.description}</p>}
              {cafe.serving.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant/70 mb-1">Serving</p>
                  <div className="flex flex-wrap gap-1">{cafe.serving.map((s) => <Chip key={s} label={s} />)}</div>
                </div>
              )}
              {cafe.services.length > 0 && (
                <div>
                  <p className="text-xs text-on-surface-variant/70 mb-1">Services</p>
                  <div className="flex flex-wrap gap-1">{cafe.services.map((s) => <Chip key={s} label={s} />)}</div>
                </div>
              )}
            </section>
          )}

          {(cafe.coverImageUrl || cafe.logoUrl) && (
            <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
              <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Images</h2>
              <div className="flex gap-4">
                {cafe.coverImageUrl && (
                  <div>
                    <p className="text-xs text-on-surface-variant/70 mb-1">Cover</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cafe.coverImageUrl} alt="Cover" className="h-24 w-40 object-cover rounded-lg" />
                  </div>
                )}
                {cafe.logoUrl && (
                  <div>
                    <p className="text-xs text-on-surface-variant/70 mb-1">Logo</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cafe.logoUrl} alt="Logo" className="h-24 w-24 object-cover rounded-lg" />
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Meta</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-on-surface-variant/70 text-xs mb-0.5">Registered</dt>
                <dd className="font-medium">{new Date(cafe.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant/70 text-xs mb-0.5">Last Modified</dt>
                <dd className="font-medium">{new Date(cafe.updatedAt).toLocaleString()}</dd>
              </div>
              {cafe.owner && (
                <div>
                  <dt className="text-on-surface-variant/70 text-xs mb-0.5">Owner</dt>
                  <dd className="font-medium">{cafe.owner.email}</dd>
                </div>
              )}
              {cafe.rejectedReason && (
                <div className="col-span-2">
                  <dt className="text-on-surface-variant/70 text-xs mb-0.5">Rejection Reason</dt>
                  <dd className="font-medium text-error">{cafe.rejectedReason}</dd>
                </div>
              )}
            </dl>
          </section>

          {cafe.proposals.length > 0 && (
            <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
              <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Enrichment History (last 5)</h2>
              <table className="w-full text-xs">
                <thead className="text-left text-on-surface-variant/70 border-b border-outline-variant/20">
                  <tr>
                    <th className="pb-2 font-semibold">Field</th>
                    <th className="pb-2 font-semibold">Type</th>
                    <th className="pb-2 font-semibold">Current → Proposed</th>
                    <th className="pb-2 font-semibold">Confidence</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cafe.proposals.map((p, i) => (
                    <tr key={i} className="border-t border-outline-variant/10">
                      <td className="py-2 font-mono">{p.fieldKey}</td>
                      <td className="py-2">{p.changeType}</td>
                      <td className="py-2 text-on-surface-variant max-w-xs truncate">
                        {String(p.currentValue ?? "—")} → {String(p.proposedValue)}
                      </td>
                      <td className="py-2">{Math.round(p.confidence * 100)}%</td>
                      <td className="py-2">{p.status}</td>
                      <td className="py-2 text-on-surface-variant/70">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {mode === "edit" && (
        <div className="space-y-8">
          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Basic Info</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["name", "city", "country", "address", "website", "email", "instagram", "phone", "priceRange"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-on-surface-variant/70 mb-1 capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-on-surface-variant/70 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  value={form.seatingCapacity}
                  onChange={(e) => setForm((f) => ({ ...f, seatingCapacity: e.target.value }))}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Description</h2>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
            />
          </section>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full editorial-shadow">
            <h3 className="font-bold text-lg mb-3">Reject Cafe</h3>
            <p className="text-sm text-on-surface-variant mb-4">Provide a reason that will be sent to the cafe owner.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Rejection reason…"
              className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface-container focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isPending}
                className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-bold disabled:opacity-50"
              >
                {isPending ? "Rejecting…" : "Send Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
