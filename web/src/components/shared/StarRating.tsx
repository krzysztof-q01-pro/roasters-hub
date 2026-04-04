export function StarRating({ rating }: { rating: number }) {
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
