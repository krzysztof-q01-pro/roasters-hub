import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE "enrichment_proposals"
    SET status = 'APPLIED'
    WHERE status = 'APPROVED'
  `;
  console.log(`Migrated ${result} proposals from APPROVED to APPLIED`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
