// Prisma client singleton
// Will be activated once DATABASE_URL is configured
// Run `npx prisma generate` after setting up .env.local

// import { PrismaClient } from "@prisma/client";
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
// export const prisma = globalForPrisma.prisma ?? new PrismaClient();
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export {};
