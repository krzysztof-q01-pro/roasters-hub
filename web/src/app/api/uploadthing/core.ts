import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
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
        select: { roasterId: true },
      });
      if (!profile?.roasterId) throw new Error("No roaster linked");

      return { roasterId: profile.roasterId };
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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
