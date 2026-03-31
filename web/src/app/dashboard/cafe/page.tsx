import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { db } from "@/lib/db";
import { CafeDashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CafeDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await db.userProfile.findUnique({
    where: { id: userId },
    include: {
      cafe: {
        include: {
          roasters: {
            include: {
              roaster: { select: { id: true, name: true, slug: true, city: true } },
            },
          },
        },
      },
    },
  });

  if (!profile?.cafe) redirect("/dashboard/saved-roasters");

  const { cafe } = profile;

  return (
    <>
      <Header />
      <CafeDashboardClient
        cafe={{
          id: cafe.id,
          name: cafe.name,
          slug: cafe.slug,
          city: cafe.city,
          country: cafe.country,
          status: cafe.status,
        }}
        linkedRoasters={cafe.roasters.map(({ roaster }) => ({
          id: roaster.id,
          name: roaster.name,
          slug: roaster.slug,
          city: roaster.city,
        }))}
      />
      <Footer />
    </>
  );
}
