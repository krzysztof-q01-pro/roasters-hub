import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Test Data Factory — creates deterministic test entities.
 * All factory functions return the created entity + a cleanup function.
 */
export const TestDataFactory = {
  counter: 0,

  uniqueSlug(prefix: string): string {
    this.counter += 1;
    return `${prefix}-e2e-${Date.now()}-${this.counter}`;
  },

  async createRoaster(overrides?: Partial<Prisma.RoasterCreateInput>) {
    const slug = this.uniqueSlug("roaster");
    const data: Prisma.RoasterCreateInput = {
      name: `Test Roastery ${this.counter}`,
      slug,
      country: "Poland",
      countryCode: "PL",
      city: "Warsaw",
      status: "VERIFIED",
      description: "A test roastery for E2E testing",
      ...overrides,
    };

    const roaster = await db.roaster.create({ data });

    return {
      roaster,
      cleanup: async () => {
        await db.roaster.delete({ where: { id: roaster.id } }).catch(() => {});
      },
    };
  },

  async createCafe(overrides?: Partial<Prisma.CafeCreateInput>) {
    const slug = this.uniqueSlug("cafe");
    const data: Prisma.CafeCreateInput = {
      name: `Test Cafe ${this.counter}`,
      slug,
      country: "Poland",
      countryCode: "PL",
      city: "Warsaw",
      status: "VERIFIED",
      description: "A test cafe for E2E testing",
      address: "Test Street 123",
      ...overrides,
    };

    const cafe = await db.cafe.create({ data });

    return {
      cafe,
      cleanup: async () => {
        await db.cafe.delete({ where: { id: cafe.id } }).catch(() => {});
      },
    };
  },

  async createReview(overrides?: Partial<Prisma.ReviewCreateInput>) {
    const data: Prisma.ReviewCreateInput = {
      authorName: "Test Reviewer",
      rating: 4,
      comment: "Great coffee! This is a test review.",
      status: "APPROVED",
      ...overrides,
    };

    const review = await db.review.create({ data });

    return {
      review,
      cleanup: async () => {
        await db.review.delete({ where: { id: review.id } }).catch(() => {});
      },
    };
  },

  async createUserProfile(role: "ADMIN" | "ROASTER" | "CAFE") {
    const id = this.uniqueSlug("user");
    const data: Prisma.UserProfileCreateInput = {
      id,
      email: `test-${role.toLowerCase()}-${this.counter}@beanmap.cafe`,
      role,
    };

    const user = await db.userProfile.create({ data });

    return {
      user,
      cleanup: async () => {
        await db.userProfile
          .delete({ where: { id: user.id } })
          .catch(() => {});
      },
    };
  },
};
