import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminReviewsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/");

  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roaster: { select: { name: true, slug: true } },
    },
  });

  const serialized = reviews.map(
    (r: {
      id: string;
      authorName: string;
      rating: number;
      comment: string | null;
      status: string;
      createdAt: Date;
      roaster: { name: string; slug: string };
    }) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      roasterName: r.roaster.name,
      roasterSlug: r.roaster.slug,
    }),
  );

  return <AdminReviewsClient reviews={serialized} />;
}
