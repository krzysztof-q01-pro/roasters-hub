type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export function CafeReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-on-surface-variant/60 text-sm">No reviews yet. Be the first!</p>
    );
  }
  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="bg-surface-container rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{r.authorName}</span>
            <span className="text-primary font-semibold">{"★".repeat(r.rating)}</span>
          </div>
          {r.comment && (
            <p className="text-sm text-on-surface-variant/70">{r.comment}</p>
          )}
          <p className="text-xs text-on-surface-variant/40 mt-2">
            {new Date(r.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
