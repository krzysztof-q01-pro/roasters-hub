import { db } from "@/lib/db";
import { MapContent } from "./MapContent";

export const revalidate = 3600; // re-generate every hour

export default async function MapPage() {
  const roasters = await db.roaster.findMany({
    where: {
      status: "VERIFIED",
      lat: { not: null },
      lng: { not: null },
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  return <MapContent roasters={roasters} />;
}
