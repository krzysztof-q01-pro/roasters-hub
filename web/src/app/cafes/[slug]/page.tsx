import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CafeReviewForm } from "@/components/cafes/CafeReviewForm";
import { CafeReviewList } from "@/components/cafes/CafeReviewList";
import { db } from "@/lib/db";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const cafes = await db.cafe.findMany({
      where: { status: "VERIFIED" },
      select: { slug: true },
    });
    return cafes.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export default async function CafeProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cafe = await db.cafe.findUnique({
    where: { slug },
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
      coverImageUrl: true,
      openingHours: true,
      serving: true,
      services: true,
      sourceUrl: true,
      status: true,
      featured: true,
      createdAt: true,
      updatedAt: true,
      roasters: {
        include: {
          roaster: {
            select: { id: true, name: true, slug: true, city: true, country: true },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cafe || cafe.status !== "VERIFIED") notFound();

  const avgRating =
    cafe.reviews.length > 0
      ? cafe.reviews.reduce((sum, r) => sum + r.rating, 0) / cafe.reviews.length
      : null;

  const serializedReviews = cafe.reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16">
        {cafe.coverImageUrl && (
          <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-10">
            <Image
              src={cafe.coverImageUrl}
              alt={cafe.name}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        <div className="mb-10">
          <h1 className="font-headline text-5xl italic tracking-tight mb-2">{cafe.name}</h1>
          <p className="text-on-surface-variant/60">
            {cafe.city}, {cafe.country}
          </p>
          {avgRating !== null && (
            <p className="text-primary font-semibold mt-1">
              ★ {avgRating.toFixed(1)} ({cafe.reviews.length} review
              {cafe.reviews.length !== 1 ? "s" : ""})
            </p>
          )}
          {cafe.description && (
            <p className="mt-4 text-on-surface-variant/80 leading-relaxed">{cafe.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-12 text-sm">
          {cafe.website && (
            <a
              href={cafe.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Website ↗
            </a>
          )}
          {cafe.instagram && (
            <a
              href={`https://instagram.com/${cafe.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @{cafe.instagram.replace("@", "")}
            </a>
          )}
          {cafe.address && (
            <span className="text-on-surface-variant/60">{cafe.address}</span>
          )}
          {cafe.sourceUrl && (
            <a
              href={cafe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant/60 hover:underline"
            >
              European Coffee Trip ↗
            </a>
          )}
        </div>

        {(cafe.serving.length > 0 || cafe.services.length > 0) && (
          <div className="mb-12 grid gap-6 sm:grid-cols-2">
            {cafe.serving.length > 0 && (
              <div>
                <h2 className="font-headline text-xl italic mb-3">What they serve</h2>
                <div className="flex flex-wrap gap-2">
                  {cafe.serving.map((item) => (
                    <span key={item} className="bg-surface-container text-sm px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {cafe.services.length > 0 && (
              <div>
                <h2 className="font-headline text-xl italic mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {cafe.services.map((item) => (
                    <span key={item} className="bg-surface-container text-sm px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {cafe.openingHours && (
          <div className="mb-12">
            <h2 className="font-headline text-xl italic mb-3">Opening hours</h2>
            <div className="text-sm text-on-surface-variant/80 space-y-1">
              {cafe.openingHours.split("\n").map((line, i) => {
                const [day, hours] = line.split("\t");
                return (
                  <div key={i} className="flex gap-4">
                    <span className="w-28 font-medium">{day}</span>
                    <span>{hours}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <section className="mb-12">
          <h2 className="font-headline text-2xl italic mb-4">Roasters we serve</h2>
          {cafe.roasters.length === 0 ? (
            <p className="text-on-surface-variant/60 text-sm">No roasters listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cafe.roasters.map(({ roaster }) => (
                <Link
                  key={roaster.id}
                  href={`/roasters/${roaster.slug}`}
                  className="bg-surface-container rounded-xl p-4 hover:bg-surface-container-high transition-colors"
                >
                  <p className="font-medium">{roaster.name}</p>
                  <p className="text-sm text-on-surface-variant/60">
                    {roaster.city}, {roaster.country}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-headline text-2xl italic mb-6">Reviews</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <CafeReviewList reviews={serializedReviews} />
            <CafeReviewForm cafeId={cafe.id} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
