"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { createCafe } from "@/actions/cafe.actions";

export default function RegisterCafePage() {
  const t = useTranslations("register");
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
    email: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });

  const steps = t.raw("stepsCafe") as string[];

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.acceptTerms || !form.acceptPrivacy) {
      setError(t("consentRequired"));
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("city", form.city);
    fd.set("country", form.country);
    fd.set("description", form.description);
    fd.set("address", form.address);
    fd.set("lat", form.lat);
    fd.set("lng", form.lng);
    fd.set("website", form.website);
    fd.set("instagram", form.instagram);
    fd.set("phone", form.phone);
    fd.set("email", form.email);
    fd.set("acceptMarketing", form.acceptMarketing ? "true" : "false");
    const result = await createCafe(fd);
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
          <h1 className="font-headline text-4xl mb-4">{t("successTitleCafe")}</h1>
          <p className="text-on-surface-variant/60 mb-8">
            {t("successDescCafe")}
          </p>
          <Link
            href="/"
            className="bg-primary text-on-primary px-6 py-3 rounded-lg text-sm font-medium"
          >
            {t("successBackHome")}
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
        <div className="flex items-center justify-center gap-4 mb-16">
          {steps.map((label, i) => (
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
              {i < steps.length - 1 && <div className="w-12 h-px bg-surface-container-high" />}
            </div>
          ))}
        </div>

        <h1 className="font-headline text-4xl tracking-tight mb-8">{t("registerCafe")}</h1>

        {error && (
          <div className="bg-error-container text-on-error-container rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">{t("cafeName")}</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("cafeNamePlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("city")}</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t("cityPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("country")}</label>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t("countryPlaceholder")}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("description")}</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder={t("descriptionPlaceholderCafe")}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">{t("address")}</label>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("addressPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("latitude")}</label>
                <input
                  value={form.lat}
                  onChange={(e) => update("lat", e.target.value)}
                  type="number"
                  step="any"
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t("latitudePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("longitude")}</label>
                <input
                  value={form.lng}
                  onChange={(e) => update("lng", e.target.value)}
                  type="number"
                  step="any"
                  className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t("longitudePlaceholder")}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("emailAddress")}</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("cafeEmailPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("websiteUrl")}</label>
              <input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("cafeWebsitePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("instagramHandle")}</label>
              <input
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("cafeInstagramPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("phone")}</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("phonePlaceholder")}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-surface-container rounded-xl p-5 space-y-2 text-sm">
              {(
                [
                  [t("reviewName"), form.name],
                  [t("reviewLocation"), `${form.city}, ${form.country}`],
                  form.address ? [t("address"), form.address] : null,
                  form.description ? [t("description"), form.description] : null,
                  form.phone ? [t("phone"), form.phone] : null,
                  form.email ? [t("emailAddress"), form.email] : null,
                  form.website ? [t("reviewWebsite"), form.website] : null,
                  form.instagram ? [t("reviewInstagram"), form.instagram] : null,
                ] as ([string, string] | null)[]
              )
                .filter((item): item is [string, string] => item !== null)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-on-surface-variant/60">{label}</span>
                    <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
            </div>
            <p className="text-xs text-on-surface-variant/50">
              {t("reviewNote")}
            </p>

            <div className="space-y-3 pt-4 border-t border-outline/10">
              <h3 className="text-sm font-semibold text-on-surface">{t("consentsTitle")}</h3>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={form.acceptTerms}
                  onChange={(e) => setForm((prev) => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
                  {t.rich("acceptTerms", {
                    termsLink: (chunks) => (
                      <Link href="/terms" className="text-primary hover:underline" target="_blank">{chunks}</Link>
                    ),
                  })}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={form.acceptPrivacy}
                  onChange={(e) => setForm((prev) => ({ ...prev, acceptPrivacy: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
                  {t.rich("acceptPrivacy", {
                    privacyLink: (chunks) => (
                      <Link href="/privacy" className="text-primary hover:underline" target="_blank">{chunks}</Link>
                    ),
                  })}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.acceptMarketing}
                  onChange={(e) => setForm((prev) => ({ ...prev, acceptMarketing: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
                  {t("acceptMarketing")}
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
            >
              {t("back")}
            </button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && (!form.name || !form.city || !form.country)}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              {t("next")}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.acceptTerms || !form.acceptPrivacy}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? t("submittingCafe") : t("submitForReview")}
            </button>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
