"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { createCafe } from "@/actions/cafe.actions";

const STEPS = ["Basic Info", "Contact & Location", "Review & Submit"];

export default function RegisterCafePage() {
  const { userId } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    country: "",
    description: "",
    address: "",
    lat: "",
    lng: "",
    website: "",
    instagram: "",
    phone: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!userId) {
      setError("You must be signed in.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    const result = await createCafe(fd, userId);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="font-headline text-4xl italic mb-4">Registration submitted!</h1>
          <p className="text-on-surface-variant/60 mb-8">
            Your cafe profile is pending review. We&apos;ll notify you once it&apos;s verified.
          </p>
          <Link
            href="/"
            className="bg-primary text-on-primary px-6 py-3 rounded-lg text-sm font-medium"
          >
            Back to home
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1 rounded-full ${
                  i <= step ? "bg-primary" : "bg-surface-container-high"
                }`}
              />
              <p
                className={`text-xs mt-1 ${
                  i === step ? "text-primary font-medium" : "text-on-surface-variant/50"
                }`}
              >
                {s}
              </p>
            </div>
          ))}
        </div>

        <h1 className="font-headline text-4xl italic tracking-tight mb-8">Register your cafe</h1>

        {error && (
          <div className="bg-error-container text-on-error-container rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Cafe name *</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Brew Lab"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Warsaw"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Poland"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us about your cafe…"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ul. Marszałkowska 1, Warsaw"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  value={form.lat}
                  onChange={(e) => update("lat", e.target.value)}
                  type="number"
                  step="any"
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="52.2297"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  value={form.lng}
                  onChange={(e) => update("lng", e.target.value)}
                  type="number"
                  step="any"
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="21.0122"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://brewlab.coffee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="@brewlab"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+48 123 456 789"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-5 space-y-2 text-sm">
              {(
                [
                  ["Name", form.name],
                  ["Location", `${form.city}, ${form.country}`],
                  form.website ? ["Website", form.website] : null,
                  form.instagram ? ["Instagram", form.instagram] : null,
                ] as ([string, string] | null)[]
              )
                .filter((item): item is [string, string] => item !== null)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-on-surface-variant/60">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
            </div>
            <p className="text-xs text-on-surface-variant/50">
              Your profile will be reviewed by our team before going live.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && (!form.name || !form.city || !form.country)}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
