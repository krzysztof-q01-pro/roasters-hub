import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 3600; // re-generate every hour

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  NO: "Norway",
  PL: "Poland",
  IT: "Italy",
  AU: "Australia",
  JP: "Japan",
  DE: "Germany",
  DK: "Denmark",
  SE: "Sweden",
  NL: "Netherlands",
  FR: "France",
  CZ: "Czech Republic",
  CA: "Canada",
  ET: "Ethiopia",
  KE: "Kenya",
  BR: "Brazil",
};

export async function generateStaticParams() {
  const countries = await db.roaster.findMany({
    where: { status: "VERIFIED" },
    select: { countryCode: true },
    distinct: ["countryCode"],
  });
  return countries.map((c) => ({ country: c.countryCode }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const name = COUNTRY_NAMES[country] || country;
  return {
    title: `Specialty Coffee Roasters in ${name}`,
    description: `Discover verified specialty coffee roasters in ${name}. Browse profiles, origins, certifications, and more.`,
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryName = COUNTRY_NAMES[country];
  if (!countryName) notFound();

  const roasters = await db.roaster.findMany({
    where: { status: "VERIFIED", countryCode: country },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { name: "asc" },
  });

  if (roasters.length === 0) notFound();

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-on-surface-variant flex items-center gap-2 text-xs uppercase tracking-widest">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="text-[10px]">&rsaquo;</span>
          <Link className="hover:text-primary transition-colors" href="/roasters">Roasters</Link>
          <span className="text-[10px]">&rsaquo;</span>
          <span className="text-on-surface">{countryName}</span>
        </nav>

        <header className="mb-12">
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface text-editorial-tight mb-2">
            Roasters in {countryName}
          </h1>
          <p className="text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            {roasters.length} verified roaster{roasters.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {roasters.map((roaster) => (
            <RoasterCard key={roaster.id} roaster={roaster} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/roasters"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            &larr; Browse all roasters
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
