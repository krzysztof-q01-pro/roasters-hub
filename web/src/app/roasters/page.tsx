import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import { RoasterFilters } from "@/components/roasters/RoasterFilters";
import { db } from "@/lib/db";
import type { Metadata, } from "next";
import type { Prisma } from "@prisma/client";

export const revalidate = 3600; // re-generate every hour

export const metadata: Metadata = {
  title: "Specialty Coffee Roasters",
  description: "Browse verified specialty coffee roasters worldwide. Filter by country, origin, certifications, and roast style.",
};

const PAGE_SIZE = 12;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const country = typeof params.country === "string" ? params.country : undefined;
  const origins = Array.isArray(params.origin) ? params.origin : params.origin ? [params.origin] : [];
  const certs = Array.isArray(params.cert) ? params.cert : params.cert ? [params.cert] : [];
  const roast = typeof params.roast === "string" ? params.roast : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const where: Prisma.RoasterWhereInput = {
    status: "VERIFIED",
    ...(country && { countryCode: country }),
    ...(origins.length && { origins: { hasSome: origins } }),
    ...(certs.length && { certifications: { hasSome: certs } }),
    ...(roast && { roastStyles: { has: roast } }),
    ...(q && { name: { contains: q, mode: "insensitive" as const } }),
  };

  const [total, roasters, countryRows] = await Promise.all([
    db.roaster.count({ where }),
    db.roaster.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.roaster.groupBy({
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-on-surface-variant flex items-center gap-2 text-xs uppercase tracking-widest">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="text-[10px]">&rsaquo;</span>
          <span className="text-on-surface">Roasters</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface text-editorial-tight mb-2">
            Specialty Coffee Roasters
          </h1>
          <p className="text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            {total} verified roasters worldwide
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          <Suspense fallback={<div className="w-[300px]" />}>
            <RoasterFilters countries={countries} />
          </Suspense>

          <section className="flex-1">
            {/* Sort bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-container-low">
              <span className="text-sm text-on-surface-variant">
                Showing {roasters.length} of {total} results
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest font-semibold">Sort by:</span>
                <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-primary">
                  <option>Relevance</option>
                  <option>Name A–Z</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {roasters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {roasters.map((roaster) => (
                  <RoasterCard key={roaster.id} roaster={roaster} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-on-surface-variant text-lg mb-4">No roasters found for these filters</p>
                <Link href="/roasters" className="text-primary font-medium hover:underline">Clear filters</Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-20 flex items-center justify-center gap-4">
                {page > 1 && (
                  <Link href={`/roasters?page=${page - 1}`} className="flex items-center gap-1 px-4 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    &larr; Previous
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/roasters?page=${p}`}
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
                  <Link href={`/roasters?page=${page + 1}`} className="flex items-center gap-1 px-4 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Next &rarr;
                  </Link>
                )}
              </nav>
            )}
          </section>
        </div>

        {/* Suggest banner */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="mb-2 text-gray-300">Nie ma tu Twojej ulubionej palarni?</p>
          <a
            href="/suggest/roastery"
            className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
          >
            Zaproponuj palarnię →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
