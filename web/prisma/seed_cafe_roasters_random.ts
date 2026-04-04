/**
 * Script to generate random Cafe-Roaster relations
 * Each cafe gets 3-10 random roaster connections
 * Optimized: single createMany instead of 620 sequential upserts
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

  // Build all relations in memory
  const relations: { cafeId: string; roasterId: string }[] = [];
  const relationSummary: { cafe: string; count: number }[] = [];

  for (const cafe of cafes) {
    const numRelations = getRandomInt(3, 10);
    const selectedRoasters = getRandomElements(roasters, numRelations);

    for (const roaster of selectedRoasters) {
      relations.push({
        cafeId: cafe.id,
        roasterId: roaster.id,
      });
    }

    relationSummary.push({ cafe: cafe.name, count: numRelations });
  }

  // Single batch insert — replaces 620 sequential upserts
  const result = await prisma.cafeRoasterRelation.createMany({
    data: relations,
    skipDuplicates: true,
  });

  console.log(`🎉 Created ${result.count} cafe-roaster relations (batch insert)\n`);

  // Show summary
  console.log("📋 Relations per cafe:");
  for (const entry of relationSummary) {
    console.log(`   ✅ ${entry.cafe}: ${entry.count} roasters`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
