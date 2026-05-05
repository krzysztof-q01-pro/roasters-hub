import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminSettingsClient } from "./client";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/");

  const settings = await db.appSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <AdminSettingsClient
      initial={{
        imageMaxTotal: settings?.imageMaxTotal ?? 10,
        imageMaxPerUser: settings?.imageMaxPerUser ?? 1,
        imageMaxPerOwner: settings?.imageMaxPerOwner ?? 3,
        defaultPoolMax: settings?.defaultPoolMax ?? 20,
      }}
    />
  );
}
