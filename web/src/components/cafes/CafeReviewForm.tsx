"use client";

import { useState } from "react";
import { submitCafeReview } from "@/actions/review.actions";

export function CafeReviewForm({ cafeId }: { cafeId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("cafeId", cafeId);
    fd.set("rating", String(rating));
    const result = await submitCafeReview(fd);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="bg-surface-container rounded-xl p-6 text-center">
        <p className="font-medium">Thank you for your review!</p>
        <p className="text-sm text-on-surface-variant/60 mt-1">
          It will appear after moderation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container rounded-xl p-6 space-y-4">
      <h3 className="font-headline text-xl">Leave a review</h3>
      {error && <p className="text-error text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Your name</label>
        <input
          name="authorName"
          required
          minLength={2}
          maxLength={100}
          className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                n <= rating
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Comment (optional)</label>
        <textarea
          name="comment"
          maxLength={2000}
          rows={3}
          className="w-full border border-outline/30 rounded-lg px-3 py-2 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
