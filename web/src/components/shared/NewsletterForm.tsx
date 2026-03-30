"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/actions/newsletter.actions";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error);
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 text-green-800 text-sm">
        You&apos;re subscribed! Check your inbox for the latest roaster picks.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          className="flex-grow bg-surface-container-low border-none rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-background"
          placeholder="Enter your email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-primary text-on-primary px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      <div className="flex justify-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            defaultChecked
            className="text-primary focus:ring-primary"
            name="segment"
            type="radio"
            value="CONSUMER"
          />
          <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
            I&apos;m a Coffee Lover
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            className="text-primary focus:ring-primary"
            name="segment"
            type="radio"
            value="CAFE"
          />
          <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
            I&apos;m a Caf&eacute;
          </span>
        </label>
      </div>
      {status === "error" && (
        <p className="text-red-600 text-sm">{errorMsg}</p>
      )}
    </form>
  );
}
