import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CafeCard } from "@/components/cafes/CafeCard";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await db.cafe.findMany({
      where: { status: "VERIFIED" },
      select: { countryCode: true, city: true },
      distinct: ["countryCode", "city"],
    });
    return rows.map((r) => ({
      country: r.countryCode,
      city: r.city.toLowerCase().replace(/\s+/g, "-"),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; city: string; locale: string }>;
}): Promise<Metadata> {
  const { country, city, locale } = await params;
  const t = await getTranslations({ locale, namespace: "profiles" });
  const row = await db.cafe.findFirst({
    where: {
      countryCode: country,
      status: "VERIFIED",
      city: { equals: city.replace(/-/g, " "), mode: "insensitive" },
    },
    select: { city: true, country: true },
  });
  if (!row) return { title: t("specialtyCoffeeCafes") };
  return {
    title: t("cityCafesTitle", { city: row.city, country: row.country }),
    description: t("cityCafesDescription", { city: row.city, country: row.country }),
  };
}

export default async function CafeCityPage({
  params,
}: {
  params: Promise<{ country: string; city: string; locale: string }>;
}) {
  const { country, city, locale } = await params;
  const t = await getTranslations({ locale, namespace: "profiles" });

  const cafes = await db.cafe.findMany({
    where: {
      status: "VERIFIED",
      countryCode: country,
      city: { equals: city.replace(/-/g, " "), mode: "insensitive" },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      city: true,
      country: true,
      countryCode: true,
      coverImageUrl: true,
      status: true,
      _count: { select: { roasters: true, reviews: true } },
    },
  });

  if (cafes.length === 0) notFound();

  const countryName = cafes[0].country;
  const cityName = cafes[0].city;

  const cafesWithRating = await Promise.all(
    cafes.map(async (cafe) => {
      const agg = await db.review.aggregate({
        where: { cafeId: cafe.id, status: "APPROVED" },
        _avg: { rating: true },
      });
      return { ...cafe, averageRating: agg._avg.rating };
    })
  );

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <nav className="mb-4 text-on-surface-variant flex items-center gap-2 text-xs uppercase tracking-widest">
          <Link className="hover:text-primary transition-colors" href="/">{t("home")}</Link>
          <span className="text-[10px]">&rsaquo;</span>
          <Link className="hover:text-primary transition-colors" href="/cafes">{t("cafes")}</Link>
          <span className="text-[10px]">&rsaquo;</span>
          <Link
            className="hover:text-primary transition-colors"
            href={`/cafes/country/${country}`}
          >
            {countryName}
          </Link>
          <span className="text-[10px]">&rsaquo;</span>
          <span className="text-on-surface">{cityName}</span>
        </nav>

        <header className="mb-12">
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface text-editorial-tight mb-2">
            {t("cityCafesTitle", { city: cityName })}
          </h1>
          <p className="text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            {t("verifiedCafeCountWithCountry", { count: cafes.length, country: countryName })}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {cafesWithRating.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={`/cafes/country/${country}`}
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            &larr; {t("allCafesInCountry", { country: countryName })}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
