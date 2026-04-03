/**
 * Script to generate random Cafe-Roaster relations
 * Each cafe gets 3-10 random roaster connections
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Get random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array and return n elements
function getRandomElements<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function main() {
  console.log("Generating random cafe-roaster relations...\n");

  // Get all cafes and roasters
  const cafes = await prisma.cafe.findMany({
    where: { status: "VERIFIED" },
    select: { id: true, slug: true, name: true },
  });

  const roasters = await prisma.roaster.findMany({
    where: { status: "VERIFIED" },
    select: { id: true, slug: true, name: true },
  });

  console.log(`Found ${cafes.length} cafes and ${roasters.length} roasters\n`);

  if (cafes.length === 0 || roasters.length === 0) {
    console.log("❌ Need at least some cafes and roasters to create relations");
    return;
  }

  let totalCreated = 0;
  const createdRelations = [];

  // For each cafe, create 3-10 random roaster relations
  for (const cafe of cafes) {
    const numRelations = getRandomInt(3, 10);
    const selectedRoasters = getRandomElements(roasters, numRelations);

    for (const roaster of selectedRoasters) {
      try {
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

        createdRelations.push({
          cafe: cafe.name,
          roaster: roaster.name,
        });
        totalCreated++;
      } catch (error) {
        console.error(`Error creating relation: ${cafe.slug} → ${roaster.slug}`, error);
      }
    }

    console.log(`✅ ${cafe.name}: ${numRelations} roasters`);
  }

  console.log(`\n🎉 Created ${totalCreated} cafe-roaster relations`);

  // Show some sample relations
  console.log("\n📋 Sample relations:");
  createdRelations.slice(0, 10).forEach((rel) => {
    console.log(`   • ${rel.cafe} → ${rel.roaster}`);
  });

  if (createdRelations.length > 10) {
    console.log(`   ... and ${createdRelations.length - 10} more`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
