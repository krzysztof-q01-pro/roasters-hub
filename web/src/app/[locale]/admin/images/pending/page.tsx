import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPendingImagesClient } from "./client";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

interface PendingImage {
  id: string;
  url: string;
  entityType: "CAFE" | "ROASTER";
  entityName: string | null;
  uploadedBy: string;
  createdAt: string;
}

export default async function AdminPendingImagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/");

  const images = await db.image.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { email: true } } },
  });

  const serialized: PendingImage[] = await Promise.all(
    images.map(async (img) => {
      let entityName: string | null = null;
      if (img.roasterId) {
        const r = await db.roaster.findUnique({
          where: { id: img.roasterId },
          select: { name: true },
        });
        entityName = r?.name ?? null;
      } else if (img.cafeId) {
        const c = await db.cafe.findUnique({
          where: { id: img.cafeId },
          select: { name: true },
        });
        entityName = c?.name ?? null;
      }
      return {
        id: img.id,
        url: img.url,
        entityType: img.entityType,
        entityName,
        uploadedBy: img.uploadedBy.email,
        createdAt: img.createdAt.toISOString(),
      };
    }),
  );

  return <AdminPendingImagesClient images={serialized} />;
}
