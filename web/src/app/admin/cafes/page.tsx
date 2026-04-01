import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminCafesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCafesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/");

  const cafes = await db.cafe.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      country: true,
      status: true,
      createdAt: true,
      owner: { select: { email: true } },
    },
  });

  const serialized = cafes.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    city: c.city,
    country: c.country,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    owner: c.owner ? { email: c.owner.email } : null,
  }));

  return <AdminCafesClient cafes={serialized} />;
}
