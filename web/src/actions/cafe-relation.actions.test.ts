import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    cafeRoasterRelation: { create: vi.fn(), delete: vi.fn() },
    roaster: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/auth", () => ({ requireCafeOwner: vi.fn() }));

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCafeOwner } from "@/lib/auth";
import {
  addCafeRoasterRelation,
  removeCafeRoasterRelation,
} from "@/actions/cafe-relation.actions";

const mockCreate = db.cafeRoasterRelation.create as unknown as ReturnType<typeof vi.fn>;
const mockDelete = db.cafeRoasterRelation.delete as unknown as ReturnType<typeof vi.fn>;
const mockOwner = vi.mocked(requireCafeOwner);
const mockRevalidatePath = vi.mocked(revalidatePath);

beforeEach(() => vi.clearAllMocks());

describe("addCafeRoasterRelation", () => {
  it("creates relation and revalidates both profile paths", async () => {
    mockOwner.mockResolvedValue("user_1");
    mockCreate.mockResolvedValue({});

    const result = await addCafeRoasterRelation(
      "cafe_1",
      "roaster_1",
      "brew-lab",
      "rocket-roasters",
    );

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith({
      data: { cafeId: "cafe_1", roasterId: "roaster_1" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/cafes/brew-lab");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/roasters/rocket-roasters");
  });

  it("returns error when not cafe owner", async () => {
    mockOwner.mockRejectedValue(new Error("Forbidden"));
    const result = await addCafeRoasterRelation(
      "cafe_1",
      "roaster_1",
      "brew-lab",
      "rocket-roasters",
    );
    expect(result.success).toBe(false);
  });
});

describe("removeCafeRoasterRelation", () => {
  it("deletes relation using compound unique key", async () => {
    mockOwner.mockResolvedValue("user_1");
    mockDelete.mockResolvedValue({});

    const result = await removeCafeRoasterRelation(
      "cafe_1",
      "roaster_1",
      "brew-lab",
      "rocket-roasters",
    );

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { cafeId_roasterId: { cafeId: "cafe_1", roasterId: "roaster_1" } },
    });
  });
});
