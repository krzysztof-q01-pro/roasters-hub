import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CafeCard } from "@/components/cafes/CafeCard";
import { db } from "@/lib/db";

export const revalidate = 3600;

export const metadata = {
  title: "Coffee Cafes — roasters-hub",
  description: "Discover specialty coffee cafes and see which roasters they serve.",
};

export default async function CafesPage() {
  const cafes = await db.cafe.findMany({
    where: { status: "VERIFIED" },
    orderBy: { name: "asc" },
    include: { _count: { select: { roasters: true, reviews: true } } },
  });

  const cafesWithRating = await Promise.all(
    cafes.map(async (cafe) => {
      const agg = await db.review.aggregate({
        where: { cafeId: cafe.id, status: "APPROVED" },
        _avg: { rating: true },
      });
      return { ...cafe, averageRating: agg._avg.rating };
    }),
  );

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="font-headline text-5xl italic tracking-tight mb-3">Coffee Cafes</h1>
          <p className="text-on-surface-variant/60 font-light text-lg">
            Discover specialty cafes and the roasters they serve.
          </p>
        </div>
        {cafesWithRating.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-on-surface-variant/60">No cafes listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cafesWithRating.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
