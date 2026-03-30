import { describe, it, expect, afterEach, afterAll, beforeAll } from "vitest";
import { db } from "@/lib/db";
import {
  cleanupTestRoasters,
  createTestRoaster,
  TEST_PREFIX,
  testSuffix,
} from "@/test/db-helpers";

beforeAll(() => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for integration tests.\n" +
        "Set it in .env.local or pass it via CI environment.",
    );
  }
});

afterEach(async () => {
  await cleanupTestRoasters();
});

afterAll(async () => {
  await cleanupTestRoasters();
  await db.$disconnect();
});

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

describe("Roaster — create", () => {
  it("creates a roaster and retrieves it by slug", async () => {
    const roaster = await createTestRoaster();

    const found = await db.roaster.findUnique({
      where: { slug: roaster.slug },
    });

    expect(found).not.toBeNull();
    expect(found!.name).toBe(roaster.name);
    expect(found!.city).toBe("Opole");
    expect(found!.countryCode).toBe("PL");
  });

  it("defaults status to PENDING", async () => {
    const roaster = await createTestRoaster();
    expect(roaster.status).toBe("PENDING");
  });

  it("accepts an explicit VERIFIED status", async () => {
    const roaster = await createTestRoaster({ status: "VERIFIED" });
    expect(roaster.status).toBe("VERIFIED");
  });

  it("enforces unique slug constraint", async () => {
    const slug = `${TEST_PREFIX}dup-${testSuffix()}`;

    await db.roaster.create({
      data: {
        name: `${TEST_PREFIX}first`,
        slug,
        city: "Warsaw",
        country: "Poland",
        countryCode: "PL",
      },
    });

    await expect(
      db.roaster.create({
        data: {
          name: `${TEST_PREFIX}second`,
          slug, // same slug — should fail
          city: "Krakow",
          country: "Poland",
          countryCode: "PL",
        },
      }),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Query — status filter (mirrors GET /api/v1/roasters logic)
// ---------------------------------------------------------------------------

describe("Roaster — status filter", () => {
  it("returns VERIFIED roasters and excludes PENDING", async () => {
    const pending = await createTestRoaster({ status: "PENDING" });
    const verified = await createTestRoaster({ status: "VERIFIED" });

    const results = await db.roaster.findMany({
      where: {
        status: "VERIFIED",
        name: { startsWith: TEST_PREFIX },
      },
      select: { id: true },
    });

    const ids = results.map((r) => r.id);
    expect(ids).toContain(verified.id);
    expect(ids).not.toContain(pending.id);
  });
});

// ---------------------------------------------------------------------------
// Query — countryCode filter (mirrors GET /api/v1/roasters?country=XX logic)
// ---------------------------------------------------------------------------

describe("Roaster — countryCode filter", () => {
  it("filters by countryCode case-insensitively via toUpperCase()", async () => {
    const pl = await createTestRoaster({ countryCode: "PL" });
    const de = await createTestRoaster({
      country: "Germany",
      countryCode: "DE",
    });

    const countryParam = "pl"; // simulate raw query param
    const results = await db.roaster.findMany({
      where: {
        countryCode: countryParam.toUpperCase(),
        name: { startsWith: TEST_PREFIX },
      },
      select: { id: true },
    });

    const ids = results.map((r) => r.id);
    expect(ids).toContain(pl.id);
    expect(ids).not.toContain(de.id);
  });
});

// ---------------------------------------------------------------------------
// Query — pagination (mirrors limit/offset in GET /api/v1/roasters)
// ---------------------------------------------------------------------------

describe("Roaster — pagination", () => {
  it("respects limit and offset", async () => {
    // create 3 test roasters
    await Promise.all([
      createTestRoaster(),
      createTestRoaster(),
      createTestRoaster(),
    ]);

    const page1 = await db.roaster.findMany({
      where: { name: { startsWith: TEST_PREFIX } },
      orderBy: { name: "asc" },
      take: 2,
      skip: 0,
    });

    const page2 = await db.roaster.findMany({
      where: { name: { startsWith: TEST_PREFIX } },
      orderBy: { name: "asc" },
      take: 2,
      skip: 2,
    });

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(1);

    // no overlap
    const p1ids = page1.map((r) => r.id);
    const p2ids = page2.map((r) => r.id);
    expect(p1ids.some((id) => p2ids.includes(id))).toBe(false);
  });
});
