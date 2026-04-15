"use client";

import { useState, useTransition } from "react";
import { verifyRoaster, rejectRoaster, adminUpdateRoaster } from "@/actions/admin.actions";

type Proposal = {
  changeType: string;
  fieldKey: string;
  currentValue: string | null;
  proposedValue: string;
  confidence: number;
  status: string;
  createdAt: string;
};

type Roaster = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  status: string;
  description: string | null;
  website: string | null;
  email: string | null;
  instagram: string | null;
  phone: string | null;
  certifications: string[];
  origins: string[];
  brewingMethods: string[];
  foundedYear: number | null;
  wholesaleAvailable: boolean | null;
  subscriptionAvailable: boolean | null;
  hasCafe: boolean | null;
  hasTastingRoom: boolean | null;
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
  INACTIVE: "bg-surface-container-high text-on-surface-variant",
};

function BoolBadge({ value, label }: { value: boolean | null; label: string }) {
  if (value === null) return <span className="text-xs text-on-surface-variant/50">{label}: —</span>;
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${value ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"}`}>
      {label}: {value ? "Yes" : "No"}
    </span>
  );
}

function Chip({ label }: { label: string }) {
  return <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container text-xs font-medium">{label}</span>;
}

export function AdminRoasterDetailClient({ roaster }: { roaster: Roaster }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Edit form state
  const [form, setForm] = useState({
    name: roaster.name,
    city: roaster.city,
    country: roaster.country,
    description: roaster.description ?? "",
    website: roaster.website ?? "",
    email: roaster.email ?? "",
    instagram: roaster.instagram ?? "",
    phone: roaster.phone ?? "",
    certifications: roaster.certifications.join(", "),
    origins: roaster.origins.join(", "),
    brewingMethods: roaster.brewingMethods.join(", "),
    foundedYear: roaster.foundedYear?.toString() ?? "",
    wholesaleAvailable: roaster.wholesaleAvailable,
    subscriptionAvailable: roaster.subscriptionAvailable,
    hasCafe: roaster.hasCafe,
    hasTastingRoom: roaster.hasTastingRoom,
  });

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyRoaster(roaster.id);
      if (!result.success) setError(result.error ?? "Something went wrong");
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await rejectRoaster(roaster.id, rejectReason);
      if (!result.success) setError(result.error ?? "Something went wrong");
      else setShowRejectModal(false);
    });
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await adminUpdateRoaster(roaster.id, {
        name: form.name || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
        email: form.email || undefined,
        instagram: form.instagram || undefined,
        phone: form.phone || undefined,
        certifications: form.certifications ? form.certifications.split(",").map((s) => s.trim()).filter(Boolean) : [],
        origins: form.origins ? form.origins.split(",").map((s) => s.trim()).filter(Boolean) : [],
        brewingMethods: form.brewingMethods ? form.brewingMethods.split(",").map((s) => s.trim()).filter(Boolean) : [],
        foundedYear: form.foundedYear ? parseInt(form.foundedYear, 10) || null : null,
        wholesaleAvailable: form.wholesaleAvailable,
        subscriptionAvailable: form.subscriptionAvailable,
        hasCafe: form.hasCafe,
        hasTastingRoom: form.hasTastingRoom,
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
          <h1 className="font-headline text-3xl font-bold text-on-background mb-1">{roaster.name}</h1>
          <p className="text-on-surface-variant">{roaster.city}, {roaster.country}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[roaster.status] ?? ""}`}>{roaster.status}</span>
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
          {roaster.status === "PENDING" && mode === "view" && (
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
                ["Name", roaster.name],
                ["City", roaster.city],
                ["Country", roaster.country],
                ["Website", roaster.website],
                ["Email", roaster.email],
                ["Instagram", roaster.instagram],
                ["Phone", roaster.phone],
                ["Founded", roaster.foundedYear?.toString()],
              ].map(([label, value]) => value ? (
                <div key={label}>
                  <dt className="text-on-surface-variant/70 text-xs mb-0.5">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ) : null)}
            </dl>
          </section>

          {(roaster.description || roaster.certifications.length > 0 || roaster.origins.length > 0 || roaster.brewingMethods.length > 0) && (
            <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
              <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Profile</h2>
              {roaster.description && <p className="text-sm mb-4 text-on-surface">{roaster.description}</p>}
              {roaster.certifications.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant/70 mb-1">Certifications</p>
                  <div className="flex flex-wrap gap-1">{roaster.certifications.map((c) => <Chip key={c} label={c} />)}</div>
                </div>
              )}
              {roaster.origins.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant/70 mb-1">Origins</p>
                  <div className="flex flex-wrap gap-1">{roaster.origins.map((o) => <Chip key={o} label={o} />)}</div>
                </div>
              )}
              {roaster.brewingMethods.length > 0 && (
                <div>
                  <p className="text-xs text-on-surface-variant/70 mb-1">Brewing Methods</p>
                  <div className="flex flex-wrap gap-1">{roaster.brewingMethods.map((m) => <Chip key={m} label={m} />)}</div>
                </div>
              )}
            </section>
          )}

          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Flags</h2>
            <div className="flex flex-wrap gap-2">
              <BoolBadge value={roaster.hasCafe} label="Has Cafe" />
              <BoolBadge value={roaster.hasTastingRoom} label="Has Tasting Room" />
              <BoolBadge value={roaster.wholesaleAvailable} label="Wholesale" />
              <BoolBadge value={roaster.subscriptionAvailable} label="Subscription" />
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Meta</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-on-surface-variant/70 text-xs mb-0.5">Registered</dt>
                <dd className="font-medium">{new Date(roaster.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant/70 text-xs mb-0.5">Last Modified</dt>
                <dd className="font-medium">{new Date(roaster.updatedAt).toLocaleString()}</dd>
              </div>
              {roaster.owner && (
                <div>
                  <dt className="text-on-surface-variant/70 text-xs mb-0.5">Owner</dt>
                  <dd className="font-medium">{roaster.owner.email}</dd>
                </div>
              )}
              {roaster.rejectedReason && (
                <div className="col-span-2">
                  <dt className="text-on-surface-variant/70 text-xs mb-0.5">Rejection Reason</dt>
                  <dd className="font-medium text-error">{roaster.rejectedReason}</dd>
                </div>
              )}
            </dl>
          </section>

          {roaster.proposals.length > 0 && (
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
                  {roaster.proposals.map((p, i) => (
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
              {(["name", "city", "country", "website", "email", "instagram", "phone"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-on-surface-variant/70 mb-1 capitalize">{field}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-on-surface-variant/70 mb-1">Founded Year</label>
                <input
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) => setForm((f) => ({ ...f, foundedYear: e.target.value }))}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant/70 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
              {(["certifications", "origins", "brewingMethods"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-on-surface-variant/70 mb-1 capitalize">{field} (comma-separated)</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <h2 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Flags</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["hasCafe", "hasTastingRoom", "wholesaleAvailable", "subscriptionAvailable"] as const).map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <select
                    value={form[field] === null ? "null" : form[field] ? "true" : "false"}
                    onChange={(e) => {
                      const v = e.target.value === "null" ? null : e.target.value === "true";
                      setForm((f) => ({ ...f, [field]: v }));
                    }}
                    className="border border-outline/30 rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                  >
                    <option value="null">Unknown</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <label className="text-sm capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</label>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full editorial-shadow">
            <h3 className="font-bold text-lg mb-3">Reject Roaster</h3>
            <p className="text-sm text-on-surface-variant mb-4">Provide a reason that will be sent to the roaster.</p>
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
