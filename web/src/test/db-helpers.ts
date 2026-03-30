import { db } from "@/lib/db";
import type { RoasterStatus } from "@prisma/client";

/** Prefix used on all test-created records — makes bulk cleanup safe */
export const TEST_PREFIX = "__test__";

/** Unique suffix to avoid slug collisions between parallel test runs */
export function testSuffix(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Delete all roasters created by tests */
export async function cleanupTestRoasters(): Promise<void> {
  await db.roaster.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  });
}

/** Create a minimal roaster for use in tests */
export async function createTestRoaster(overrides?: {
  name?: string;
  slug?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  status?: RoasterStatus;
  featured?: boolean;
}) {
  const suffix = testSuffix();
  return db.roaster.create({
    data: {
      name: `${TEST_PREFIX}roaster-${suffix}`,
      slug: `${TEST_PREFIX}roaster-${suffix}`,
      city: "Opole",
      country: "Poland",
      countryCode: "PL",
      status: "PENDING",
      ...overrides,
    },
  });
}
