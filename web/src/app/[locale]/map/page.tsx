import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { MapContent } from "./MapContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const revalidate = 3600;

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
      coverImageUrl: true,
      services: true,
    },
  });

  return <MapContent roasters={roasters} cafes={cafes} />;
}
