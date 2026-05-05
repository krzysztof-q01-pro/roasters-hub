import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminImagesClient } from "./client";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

interface ImageWithUser {
  id: string;
  url: string;
  entityType: "CAFE" | "ROASTER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  isDefault: boolean;
  createdAt: string;
  uploadedBy: string;
}

export default async function AdminImagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/");

  const images = await db.image.findMany({
    where: { isDefault: true },
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { email: true } } },
  });

  const serialized: ImageWithUser[] = images.map((img) => ({
    id: img.id,
    url: img.url,
    entityType: img.entityType,
    status: img.status,
    isDefault: img.isDefault,
    createdAt: img.createdAt.toISOString(),
    uploadedBy: img.uploadedBy.email,
  }));

  return <AdminImagesClient images={serialized} />;
}
