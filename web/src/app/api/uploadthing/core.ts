import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  roasterImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");

      const profile = await db.userProfile.findUnique({
        where: { id: userId },
        select: { ownedRoasters: { select: { id: true } } },
      });
      if (!profile?.ownedRoasters.length) throw new Error("No roaster linked");

      return { roasterId: profile.ownedRoasters[0].id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Replace existing primary image
      await db.roasterImage.deleteMany({
        where: { roasterId: metadata.roasterId, isPrimary: true },
      });

      await db.roasterImage.create({
        data: {
          roasterId: metadata.roasterId,
          url: file.ufsUrl,
          alt: file.name,
          order: 0,
          isPrimary: true,
        },
      });

      return { url: file.ufsUrl };
    }),

  cafeImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");

      const cafeId = req.headers.get("x-cafe-id");
      if (!cafeId) throw new UploadThingError("Missing cafeId");

      const profile = await db.userProfile.findUnique({
        where: { id: userId },
        select: { ownedCafes: { select: { id: true } } },
      });
      const owns = profile?.ownedCafes.some((c) => c.id === cafeId);
      if (!owns) {
        throw new UploadThingError("Forbidden");
      }

      return { userId, cafeId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.cafe.update({
        where: { id: metadata.cafeId },
        data: { logoUrl: file.ufsUrl },
      });
      revalidatePath("/cafes");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
