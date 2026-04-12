function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rating ? "text-amber-500" : "text-on-surface-variant/20"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

export function ReviewList({
  reviews,
  averageRating,
}: {
  reviews: Review[];
  averageRating: number | null;
}) {
  if (reviews.length === 0) {
    return (
      <p className="text-on-surface-variant/60 text-sm">
        No reviews yet. Be the first to leave one!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {averageRating !== null && (
        <div className="flex items-center gap-3 mb-2">
          <StarRating rating={Math.round(averageRating)} />
          <span className="text-sm text-on-surface-variant/70">
            {averageRating.toFixed(1)} out of 5 ({reviews.length} review
            {reviews.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-outline-variant/10 pb-5 last:border-0"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{review.authorName}</span>
            <time
              className="text-xs text-on-surface-variant/50"
              dateTime={review.createdAt.toISOString()}
            >
              {review.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          <StarRating rating={review.rating} />
          {review.comment && (
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
