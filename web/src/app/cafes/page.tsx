import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CafeCard } from "@/components/cafes/CafeCard";
import { CafeFilters } from "@/components/cafes/CafeFilters";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Specialty Coffee Cafes",
  description: "Discover specialty coffee cafes and see which roasters they serve. Filter by country and city.",
};

const PAGE_SIZE = 12;

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const country = typeof params.country === "string" ? params.country : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const amenities = typeof params.amenities === "string"
    ? params.amenities.split(",").filter(Boolean)
    : [];

  const where: Prisma.CafeWhereInput = {
    status: "VERIFIED",
    ...(country && { countryCode: country }),
    ...(q && { name: { contains: q, mode: "insensitive" as const } }),
    ...(amenities.length > 0 && { services: { hasSome: amenities } }),
  };

  const [total, cafes, countryRows] = await Promise.all([
    db.cafe.count({ where }),
    db.cafe.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        country: true,
        countryCode: true,
        city: true,
        address: true,
        lat: true,
        lng: true,
        website: true,
        instagram: true,
        phone: true,
        logoUrl: true,
        coverImageUrl: true,
        status: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { roasters: true, reviews: true } },
      },
    }),
    db.cafe.groupBy({
      by: ["countryCode", "country"],
      where: { status: "VERIFIED" },
      _count: { _all: true },
      orderBy: { country: "asc" },
    }),
  ]);

  const countries = countryRows.map((r) => ({
    code: r.countryCode,
    name: r.country,
    count: r._count._all,
  }));

  const cafesWithRating = await Promise.all(
    cafes.map(async (cafe) => {
      const agg = await db.review.aggregate({
        where: { cafeId: cafe.id, status: "APPROVED" },
        _avg: { rating: true },
      });
      return { ...cafe, averageRating: agg._avg.rating };
    })
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <nav className="mb-4 text-on-surface-variant flex items-center gap-2 text-xs uppercase tracking-widest">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="text-[10px]">&rsaquo;</span>
          <span className="text-on-surface">Cafes</span>
        </nav>

        <header className="mb-12">
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface text-editorial-tight mb-2">
            Specialty Coffee Cafes
          </h1>
          <p className="text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            {total} verified cafes worldwide
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          <Suspense fallback={<div className="w-[300px]" />}>
            <CafeFilters countries={countries} />
          </Suspense>

          <section className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-container-low">
              <span className="text-sm text-on-surface-variant italic">
                Showing {cafes.length} of {total} results
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest font-semibold">Sort by:</span>
                <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-primary">
                  <option>Name A–Z</option>
                  <option>City</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            {cafesWithRating.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {cafesWithRating.map((cafe) => (
                  <CafeCard key={cafe.id} cafe={cafe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-on-surface-variant text-lg mb-4">No cafes found for these filters</p>
                <Link href="/cafes" className="text-primary font-medium hover:underline">Clear filters</Link>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-20 flex items-center justify-center gap-4">
                {page > 1 && (
                  <Link href={`/cafes?page=${page - 1}`} className="flex items-center gap-1 px-4 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    &larr; Previous
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/cafes?page=${p}`}
                      className={
                        p === page
                          ? "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-primary text-on-primary"
                          : "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium hover:bg-surface-container transition-colors"
                      }
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                {page < totalPages && (
                  <Link href={`/cafes?page=${page + 1}`} className="flex items-center gap-1 px-4 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Next &rarr;
                  </Link>
                )}
              </nav>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}