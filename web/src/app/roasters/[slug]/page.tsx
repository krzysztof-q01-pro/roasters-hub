import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { VerifiedBadge } from "@/components/roasters/VerifiedBadge";
import { CertificationBadge } from "@/components/roasters/CertificationBadge";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 3600; // re-generate every hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roaster = await db.roaster.findUnique({ where: { slug } });
  if (!roaster) return { title: "Roaster Not Found" };

  return {
    title: `${roaster.name} — Specialty Coffee in ${roaster.city}`,
    description: roaster.description || `Discover ${roaster.name}, a verified specialty coffee roaster in ${roaster.city}, ${roaster.country}.`,
  };
}

const FLAG_MAP: Record<string, string> = {
  US: "\u{1F1FA}\u{1F1F8}", GB: "\u{1F1EC}\u{1F1E7}", NO: "\u{1F1F3}\u{1F1F4}",
  PL: "\u{1F1F5}\u{1F1F1}", IT: "\u{1F1EE}\u{1F1F9}", AU: "\u{1F1E6}\u{1F1FA}",
  JP: "\u{1F1EF}\u{1F1F5}", DE: "\u{1F1E9}\u{1F1EA}",
};

export default async function RoasterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roaster = await db.roaster.findUnique({
    where: { slug },
    include: { images: true },
  });
  if (!roaster) notFound();

  const relatedRoasters = await db.roaster.findMany({
    where: {
      countryCode: roaster.countryCode,
      id: { not: roaster.id },
      status: "VERIFIED",
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 3,
  });

  const flag = FLAG_MAP[roaster.countryCode] || "";
  const primaryImage = roaster.images[0];
  const isVerified = roaster.status === "VERIFIED";

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <nav className="flex text-xs uppercase tracking-widest text-on-surface-variant/60 gap-2">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" href="/roasters">Roasters</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" href={`/roasters?country=${roaster.countryCode}`}>
            {roaster.country}
          </Link>
          <span>/</span>
          <span className="text-on-surface">{roaster.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="w-full h-[400px] md:h-[500px] mt-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || `${roaster.name} roastery`}
              fill
              className="object-cover opacity-70"
              sizes="100vw"
              priority
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="max-w-7xl mx-auto h-full px-6 relative flex flex-col justify-end pb-12">
          {isVerified && (
            <div className="absolute top-8 right-6">
              <VerifiedBadge size="lg" />
            </div>
          )}
          <h1 className="font-headline italic text-6xl md:text-7xl lg:text-8xl text-white tracking-tighter leading-none mb-4">
            {roaster.name}
          </h1>
          <div className="flex items-center text-white/90 gap-2 text-sm md:text-base">
            <svg className="w-5 h-5 text-primary-fixed-dim" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {flag} {roaster.city}, {roaster.country}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
        {/* Left Column */}
        <div className="space-y-16">
          {/* About */}
          <section>
            <h2 className="font-headline text-3xl mb-8 tracking-tight">About {roaster.name}</h2>
            <p className="text-lg leading-relaxed text-on-surface-variant font-light">
              {roaster.description}
            </p>
          </section>

          {/* Origins */}
          {roaster.origins.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60 mb-6">
                Coffee Origins
              </h3>
              <div className="flex flex-wrap gap-3">
                {roaster.origins.map((origin) => (
                  <span key={origin} className="bg-surface-container-high px-4 py-2 rounded-full text-sm font-medium">
                    {origin}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {roaster.certifications.length > 0 && (
            <section className="bg-surface-container-low p-8 rounded-2xl">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60 mb-8">
                Quality Certifications
              </h3>
              <div className="flex flex-wrap gap-4">
                {roaster.certifications.map((cert) => (
                  <CertificationBadge key={cert} certification={cert} className="text-sm px-4 py-2" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column — Sticky Sidebar */}
        <aside className="relative">
          <div className="sticky top-24 space-y-8">
            <div className="bg-surface-container-lowest editorial-shadow rounded-2xl p-8 border border-outline-variant/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-headline text-2xl font-bold tracking-tight">{roaster.name}</h4>
                  <p className="text-sm text-on-surface-variant/70">Specialty Roastery</p>
                </div>
                {isVerified && (
                  <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-on-surface-variant/40 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  <p className="text-sm text-on-surface-variant">{roaster.city}, {roaster.country}</p>
                </div>
                {roaster.email && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-on-surface-variant/40 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <p className="text-sm text-on-surface-variant">{roaster.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {roaster.website && (
                  <a
                    href={roaster.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-medium text-sm hover:bg-primary-container transition-all shadow-lg shadow-primary/10 block text-center"
                  >
                    Visit Website
                  </a>
                )}
                {roaster.shopUrl && (
                  <a
                    href={roaster.shopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-outline text-on-surface-variant py-3.5 rounded-lg font-medium text-sm hover:bg-surface-container-low transition-all block text-center"
                  >
                    Shop Online
                  </a>
                )}
              </div>

              {roaster.instagram && (
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-surface-container">
                  <a
                    href={`https://instagram.com/${roaster.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface-variant/60 hover:text-primary transition-colors text-sm"
                  >
                    @{roaster.instagram}
                  </a>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Related Roasters */}
      {relatedRoasters.length > 0 && (
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className="font-headline text-4xl italic tracking-tight mb-2">
                  Discover {roaster.country}
                </h3>
                <p className="text-on-surface-variant/60 font-light">
                  More specialty roasters in {roaster.country}.
                </p>
              </div>
              <Link
                className="text-xs uppercase tracking-widest font-bold text-primary pb-1 border-b-2 border-primary/20 hover:border-primary transition-all"
                href={`/roasters?country=${roaster.countryCode}`}
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedRoasters.map((r) => (
                <RoasterCard key={r.id} roaster={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
