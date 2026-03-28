"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { ROAST_STYLES, CERTIFICATIONS, CERTIFICATION_LABELS, ORIGINS } from "@/types/certifications";
import { createRoasterRegistration } from "@/actions/roaster.actions";

const STEPS = ["Basic Info", "Contact & Links", "Specialty Details"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    description: "",
    website: "",
    shopUrl: "",
    instagram: "",
    email: "",
    origins: [] as string[],
    roastStyles: [] as string[],
    certifications: [] as string[],
  });

  const updateField = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: "origins" | "roastStyles" | "certifications", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", form.name);
    formData.set("country", form.country);
    formData.set("city", form.city);
    formData.set("description", form.description);
    formData.set("website", form.website);
    formData.set("shopUrl", form.shopUrl);
    formData.set("instagram", form.instagram);
    formData.set("email", form.email);
    form.certifications.forEach((c) => formData.append("certifications", c));
    form.origins.forEach((o) => formData.append("origins", o));
    form.roastStyles.forEach((s) => formData.append("roastStyles", s));

    const result = await createRoasterRegistration(formData);

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-secondary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <h1 className="font-headline text-4xl font-bold mb-4 italic">Your profile is submitted!</h1>
          <p className="text-on-surface-variant text-lg mb-10">
            We&apos;ll review your roastery profile within 48 hours. You&apos;ll receive an email once it&apos;s verified and live.
          </p>
          <Link href="/roasters" className="bg-primary text-on-primary px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-all inline-flex items-center gap-2">
            Browse other roasters while you wait &rarr;
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
        <h1 className="sr-only">Register Your Roastery</h1>
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-16">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i < step
                      ? "bg-secondary text-on-secondary"
                      : i === step
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={`text-sm hidden sm:block ${i === step ? "font-semibold text-on-surface" : "text-on-surface-variant"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="w-12 h-px bg-surface-container-high" />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="space-y-8">
            <h2 className="font-headline text-3xl font-bold italic">Tell us about your roastery</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Roastery name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm"
                placeholder="e.g. Hard Beans"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Country *</label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm"
                  placeholder="e.g. Poland"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm"
                  placeholder="e.g. Opole"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-on-surface-variant font-normal">({form.description.length}/2000)</span>
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value.slice(0, 2000))}
                className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm resize-none"
                placeholder="Tell us about your roastery, philosophy, and what makes your coffee special..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={!form.name || !form.country || !form.city}
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact & Links */}
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="font-headline text-3xl font-bold italic">How can people find you?</h2>
            <p className="text-on-surface-variant text-sm">These will be displayed on your public profile.</p>
            <div>
              <label className="block text-sm font-medium mb-2">Website URL</label>
              <input type="url" value={form.website} onChange={(e) => updateField("website", e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm" placeholder="https://yourroastery.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Online shop URL</label>
              <input type="url" value={form.shopUrl} onChange={(e) => updateField("shopUrl", e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm" placeholder="https://shop.yourroastery.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram handle</label>
              <input type="text" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm" placeholder="@yourroastery" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm" placeholder="hello@yourroastery.com" />
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="text-on-surface-variant hover:text-on-surface transition-colors px-4 py-3">&larr; Back</button>
              <button onClick={() => setStep(2)} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all">Continue &rarr;</button>
            </div>
          </div>
        )}

        {/* Step 3: Specialty Details */}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="font-headline text-3xl font-bold italic">What makes your coffee special?</h2>

            <div>
              <label className="block text-sm font-medium mb-3">Coffee Origins</label>
              <div className="flex flex-wrap gap-2">
                {ORIGINS.map((origin) => (
                  <button
                    key={origin}
                    type="button"
                    onClick={() => toggleArray("origins", origin)}
                    className={form.origins.includes(origin)
                      ? "px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs transition-colors"
                      : "px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs hover:bg-surface-variant transition-colors"
                    }
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Roast Styles</label>
              <div className="flex flex-wrap gap-2">
                {ROAST_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleArray("roastStyles", style)}
                    className={form.roastStyles.includes(style)
                      ? "px-4 py-2 rounded-lg bg-primary text-on-primary text-sm transition-colors"
                      : "px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-sm hover:bg-surface-variant transition-colors"
                    }
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Certifications</label>
              <div className="grid grid-cols-2 gap-3">
                {CERTIFICATIONS.map((cert) => (
                  <label key={cert} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.certifications.includes(cert)}
                      onChange={() => toggleArray("certifications", cert)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      {CERTIFICATION_LABELS[cert]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-on-surface-variant hover:text-on-surface transition-colors px-4 py-3">&larr; Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
