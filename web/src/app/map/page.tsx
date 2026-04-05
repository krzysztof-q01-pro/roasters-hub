import type { Metadata } from "next";
import { db } from "@/lib/db";
import { MapContent } from "./MapContent";

export const metadata: Metadata = {
  title: "Coffee Roasters & Cafes Map",
  description: "Explore specialty coffee roasters and cafes around the world on an interactive map.",
};

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

  const cafes = await db.cafe.findMany({
    where: { status: "VERIFIED", lat: { not: null }, lng: { not: null } },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      country: true,
      lat: true,
      lng: true,
      logoUrl: true,
      services: true,
    },
  });

  return <MapContent roasters={roasters} cafes={cafes} />;
}
