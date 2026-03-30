"use client";

import { useState } from "react";
import { submitReview } from "@/actions/review.actions";

export function ReviewForm({ roasterId }: { roasterId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("roasterId", roasterId);
    formData.set("rating", String(rating));

    const result = await submitReview(formData);

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="bg-secondary-container/30 border border-secondary/20 rounded-xl p-6 text-center">
        <p className="text-secondary font-medium">
          Thank you for your review! It will appear after moderation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="review-author" className="block text-sm font-medium mb-1">Your Name</label>
        <input
          id="review-author"
          name="authorName"
          type="text"
          required
          minLength={2}
          maxLength={100}
          className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <p className="block text-sm font-medium mb-1" id="rating-label">Rating</p>
        <div className="flex gap-1" role="group" aria-labelledby="rating-label">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl transition-colors"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              <span
                className={
                  star <= (hoverRating || rating)
                    ? "text-amber-500"
                    : "text-on-surface-variant/20"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium mb-1">
          Comment <span className="text-on-surface-variant/50">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={3}
          maxLength={2000}
          className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="Share your experience with this roaster..."
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-container transition-all disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
