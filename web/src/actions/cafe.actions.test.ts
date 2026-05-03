import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    cafe: { create: vi.fn(), update: vi.fn() },
    userProfile: { update: vi.fn() },
  },
}));
vi.mock("@/lib/slug", () => ({ generateUniqueCafeSlug: vi.fn() }));
vi.mock("@/lib/country-codes", () => ({ resolveCountryCode: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendNewRegistrationNotification: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
  requireCafeOwner: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { generateUniqueCafeSlug } from "@/lib/slug";
import { resolveCountryCode } from "@/lib/country-codes";
import { requireAdmin } from "@/lib/auth";
import { createCafe, verifyCafe, rejectCafe, createCafeProposal } from "@/actions/cafe.actions";

const mockCreate = db.cafe.create as unknown as ReturnType<typeof vi.fn>;
const mockUpdate = db.cafe.update as unknown as ReturnType<typeof vi.fn>;
const mockUserUpdate = db.userProfile.update as unknown as ReturnType<typeof vi.fn>;
const mockSlug = vi.mocked(generateUniqueCafeSlug);
const mockCountryCode = vi.mocked(resolveCountryCode);
const mockRequireAdmin = vi.mocked(requireAdmin);
const mockRevalidatePath = vi.mocked(revalidatePath);

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

const validData = {
  name: "Brew Lab",
  city: "Warsaw",
  country: "Poland",
  description: "",
  address: "Main Street 42",
  lat: "",
  lng: "",
  website: "",
  instagram: "",
  phone: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSlug.mockResolvedValue("brew-lab");
  mockCountryCode.mockReturnValue("PL");
});

describe("createCafe", () => {
  it("returns fieldError when name is too short", async () => {
    const fd = makeFormData({ ...validData, name: "X" });
    const result = await createCafe(fd, "user_123");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.name).toBeDefined();
  });

  it("creates cafe, updates userProfile, revalidates /cafes", async () => {
    mockCreate.mockResolvedValue({ id: "cafe_1", slug: "brew-lab" });
    mockUserUpdate.mockResolvedValue({});
    mockUpdate.mockResolvedValue({});

    const fd = makeFormData(validData);
    const result = await createCafe(fd, "user_123");

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { role: "CAFE" },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cafe_1" },
      data: { ownerId: "user_123" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/cafes");
  });
});

describe("verifyCafe", () => {
  it("returns error when requireAdmin throws", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));
    const result = await verifyCafe("cafe_1");
    expect(result.success).toBe(false);
  });

  it("sets VERIFIED, revalidates cafes + map", async () => {
    mockRequireAdmin.mockResolvedValue("admin_1");
    mockUpdate.mockResolvedValue({ slug: "brew-lab" });

    const result = await verifyCafe("cafe_1");

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cafe_1" },
      data: { status: "VERIFIED", verifiedAt: expect.any(Date) },
      select: { slug: true },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/cafes");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/cafes/brew-lab");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/map");
  });
});

describe("rejectCafe", () => {
  it("sets REJECTED with reason", async () => {
    mockRequireAdmin.mockResolvedValue("admin_1");
    mockUpdate.mockResolvedValue({ slug: "brew-lab" });

    const result = await rejectCafe("cafe_1", "Incomplete information");

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cafe_1" },
      data: {
        status: "REJECTED",
        rejectedAt: expect.any(Date),
        rejectedReason: "Incomplete information",
      },
      select: { slug: true },
    });
  });
});

describe("createCafeProposal", () => {
  it("creates PENDING cafe with no ownerId and returns slug", async () => {
    mockCreate.mockResolvedValue({ slug: "brew-lab" });

    const fd = makeFormData({
      name: "Brew Lab",
      city: "Warsaw",
      country: "Poland",
      address: "Main Street 42",
    });
    const result = await createCafeProposal(fd);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ slug: "brew-lab" });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          name: "Brew Lab",
        }),
      })
    );
  });

  it("returns fieldError when name is too short", async () => {
    const fd = makeFormData({ name: "X", city: "Warsaw", country: "Poland", address: "Main Street 42" });
    const result = await createCafeProposal(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.name).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("stores parsed openingHours JSON", async () => {
    mockCreate.mockResolvedValue({ slug: "test" });
    const hours = JSON.stringify({ mon: { open: "08:00", close: "18:00" }, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null });
    const fd = makeFormData({ name: "Test Cafe", city: "Warsaw", country: "Poland", address: "Main Street 42", openingHours: hours });
    await createCafeProposal(fd);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          openingHours: { mon: { open: "08:00", close: "18:00" }, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
        }),
      })
    );
  });
});
