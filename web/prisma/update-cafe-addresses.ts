/**
 * Update 17 cafes with missing addresses and coordinates.
 * Sourced from Google Maps scraping (2026-04-04).
 * 
 * Usage: npx tsx prisma/update-cafe-addresses.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const CAFE_UPDATES = [
  // Munich (2)
  {
    slug: "turm-kaffee-barista-academy-munich",
    address: "Unterer Anger 20, 80331 München",
    lat: 48.1343517,
    lng: 11.5714571,
  },
  {
    slug: "the-barn-cafe-tal-munich",
    address: "Tal 15, 80331 München",
    lat: 48.1364805,
    lng: 11.5798108,
  },
  // Warsaw (7)
  {
    slug: "java-cafe-speciality-roasters-warsaw",
    address: "Żelazna 51/53, 00-841 Warszawa",
    lat: 52.2326396,
    lng: 20.9904602,
  },
  {
    slug: "bozo-warsaw",
    address: "Jurija Gagarina 8, 00-754 Warszawa",
    lat: 52.2071152,
    lng: 21.0458463,
  },
  {
    slug: "rost-microroastery-caf-warsaw",
    address: "Kobielska 55, 04-371 Warszawa",
    lat: 52.247242,
    lng: 21.082909,
  },
  {
    slug: "dot-coffeestation-warsaw",
    address: "Leszczyńska 1A, 03-732 Warszawa",
    lat: 52.2407667,
    lng: 21.0262338,
  },
  {
    slug: "cafe-central-lwowska-warsaw",
    address: "Lwowska 2A, 00-658 Warszawa",
    lat: 52.2205036,
    lng: 21.0123648,
  },
  {
    slug: "sando-cafe-warsaw",
    address: "Sandomierska 23, 02-567 Warszawa",
    lat: 52.2091909,
    lng: 21.0184932,
  },
  {
    slug: "relax-cafe-bar-warsaw",
    address: "Złota 8a, 00-019 Warszawa",
    lat: 52.2331944,
    lng: 21.0109684,
  },
  // Berlin (1)
  {
    slug: "the-barn-ku-damm-berlin",
    address: "Kurfürstendamm 21, 10719 Berlin",
    lat: 52.503964,
    lng: 13.329918,
  },
  // Poznan (7)
  {
    slug: "smash-cafe-roastery-poznan",
    address: "Bóżnicza, 61-751 Poznań",
    lat: 52.4125434,
    lng: 16.9354198,
  },
  {
    slug: "body-balance-specialty-coffee-people-poznan",
    address: "Ratajczaka 44, 61-728 Poznań",
    lat: 52.4082606,
    lng: 16.9253064,
  },
  {
    slug: "cafe-m-y-ska-poznan",
    address: "Młyńska 12, 61-730 Poznań",
    lat: 52.4108548,
    lng: 16.9259891,
  },
  {
    slug: "oki-toki-poznan",
    address: "Romualda Traugutta 32, 61-514 Poznań",
    lat: 52.3852466,
    lng: 16.9157006,
  },
  {
    slug: "oldskulowa-cafe-restaurant-poznan",
    address: "Fredry 2, 61-701 Poznań",
    lat: 52.4085817,
    lng: 16.9209107,
  },
  {
    slug: "kaferdam-zamek-poznan",
    address: "Grobla 30, 61-751 Poznań",
    lat: 52.4069518,
    lng: 16.9384011,
  },
  {
    slug: "sweet-surrender-poznan",
    address: "Krasińskiego 1/1, 60-830 Poznań",
    lat: 52.4121585,
    lng: 16.9138045,
  },
];

async function main() {
  console.log("Updating 17 cafes with addresses and coordinates...\n");

  let updated = 0;
  let notFound = 0;

  for (const cafe of CAFE_UPDATES) {
    const result = await prisma.cafe.updateMany({
      where: { slug: cafe.slug },
      data: {
        address: cafe.address,
        lat: cafe.lat,
        lng: cafe.lng,
      },
    });

    if (result.count > 0) {
      console.log(`  ✓ ${cafe.slug}`);
      console.log(`    ${cafe.address} (${cafe.lat}, ${cafe.lng})`);
      updated++;
    } else {
      console.log(`  ✗ NOT FOUND: ${cafe.slug}`);
      notFound++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not found`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
