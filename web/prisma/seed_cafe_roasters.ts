import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const CAFE_ROASTER_RELATIONS = [
  { cafeSlug: "the-barn-cafe-glockenbachviertel-munich", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "the-barn-cafe-tal-munich", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "the-barn-ku-damm-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "the-barn-neuk-lln-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "the-barn-nordbahnhof-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "the-barn-sony-center-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "19grams-tres-cabezas-caf-berlin", roasterSlug: "19grams-coffee" },
  { cafeSlug: "bonanza-coffee-berlin", roasterSlug: "bonanza-coffee" },
  { cafeSlug: "five-elephant-berlin", roasterSlug: "five-elephant" },
  { cafeSlug: "java-cafe-speciality-roasters-warsaw", roasterSlug: "java-coffee-roasters" },
  { cafeSlug: "story-coffee-warsaw", roasterSlug: "story-coffee-roasters" },
  { cafeSlug: "coffeedesk-kawiarnia-warsaw", roasterSlug: "coffeelab-warszawa" },
  { cafeSlug: "bonanza-coffee-berlin", roasterSlug: "bonanza-coffee" },
  { cafeSlug: "green-wall-coffee-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "milchhalle-berlin-coffee-berlin", roasterSlug: "bonanza-coffee" },
  { cafeSlug: "man-versus-machine-munich", roasterSlug: "man-versus-machine-munich" },
  { cafeSlug: "sltm-coffee-berlin", roasterSlug: "five-elephant" },
  { cafeSlug: "milchhalle-berlin-coffee-berlin", roasterSlug: "five-elephant" },
  { cafeSlug: "spontan-coffee-roastery-berlin", roasterSlug: "spontan-coffee-roastery-berlin" },
  { cafeSlug: "kawa-roastery-berlin", roasterSlug: "kawa-roastery-berlin" },
  { cafeSlug: "kawa-roastery-x-berg-berlin", roasterSlug: "kawa-roastery-berlin" },
  { cafeSlug: "gar-on-de-caf-coffee-shop-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "visioneers-caf-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "nothing-out-of-the-ordinary-berlin", roasterSlug: "the-barn-berlin" },
  { cafeSlug: "elswaldt-coffee-roasters-hamburg", roasterSlug: "elswaldt-coffee-roasters-hamburg" },
];

async function main() {
  console.log("Seeding cafe-roaster relations...");

  for (const rel of CAFE_ROASTER_RELATIONS) {
    try {
      const cafe = await prisma.cafe.findUnique({
        where: { slug: rel.cafeSlug },
        select: { id: true },
      });
      const roaster = await prisma.roaster.findUnique({
        where: { slug: rel.roasterSlug },
        select: { id: true },
      });

      if (!cafe || !roaster) {
        console.log(`Skipping: ${rel.cafeSlug} → ${rel.roasterSlug} (not found)`);
        continue;
      }

      await prisma.cafeRoasterRelation.upsert({
        where: {
          cafeId_roasterId: {
            cafeId: cafe.id,
            roasterId: roaster.id,
          },
        },
        update: {},
        create: {
          cafeId: cafe.id,
          roasterId: roaster.id,
        },
      });
      console.log(`Created: ${rel.cafeSlug} → ${rel.roasterSlug}`);
    } catch (error) {
      console.error(`Error: ${rel.cafeSlug} → ${rel.roasterSlug}`, error);
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());