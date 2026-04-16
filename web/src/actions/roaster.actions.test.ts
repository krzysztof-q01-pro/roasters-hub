import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must be hoisted above imports) ──────────────────────────────────

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    roaster: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/slug", () => ({
  generateUniqueSlug: vi.fn(),
}));

vi.mock("@/lib/country-codes", () => ({
  resolveCountryCode: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendNewRegistrationNotification: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/slug";
import { resolveCountryCode } from "@/lib/country-codes";
import { sendNewRegistrationNotification } from "@/lib/email";
import { createRoasterRegistration, createRoasterProposal } from "@/actions/roaster.actions";

const mockRevalidatePath = vi.mocked(revalidatePath);
const mockCreate = db.roaster.create as unknown as ReturnType<typeof vi.fn>;
const mockGenerateSlug = vi.mocked(generateUniqueSlug);
const mockResolveCountryCode = vi.mocked(resolveCountryCode);
const mockSendNotification = vi.mocked(sendNewRegistrationNotification);

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFormData(data: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

// Optional fields must be provided as empty strings — FormData.get() returns
// null for missing keys, which Zod rejects for .optional().or(z.literal(""))
const validData = {
  name: "Rocket Roasters",
  city: "Warsaw",
  country: "Poland",
  description: "",
  website: "",
  email: "",
  instagram: "",
  shopUrl: "",
};

// ── createRoasterRegistration ──────────────────────────────────────────────

describe("createRoasterRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateSlug.mockResolvedValue("rocket-roasters-warsaw");
    mockResolveCountryCode.mockReturnValue("PL");
    mockCreate.mockResolvedValue({
      slug: "rocket-roasters-warsaw",
    });
  });

  it("returns validation error when name is missing", async () => {
    const fd = makeFormData({ city: "Warsaw", country: "Poland" });
    const result = await createRoasterRegistration(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed");
      expect(result.fieldErrors).toHaveProperty("name");
    }
  });

  it("returns validation error when name is too short", async () => {
    const fd = makeFormData({ name: "A", city: "Warsaw", country: "Poland" });
    const result = await createRoasterRegistration(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toHaveProperty("name");
    }
  });

  it("returns validation error when city is missing", async () => {
    const fd = makeFormData({ name: "Rocket Roasters", country: "Poland" });
    const result = await createRoasterRegistration(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toHaveProperty("city");
    }
  });

  it("returns validation error when country is missing", async () => {
    const fd = makeFormData({ name: "Rocket Roasters", city: "Warsaw" });
    const result = await createRoasterRegistration(fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toHaveProperty("country");
    }
  });

  it("returns success with slug on valid data", async () => {
    const fd = makeFormData(validData);
    const result = await createRoasterRegistration(fd);

    expect(result).toEqual({
      success: true,
      data: { slug: "rocket-roasters-warsaw" },
    });
  });

  it("calls generateUniqueSlug with name and city", async () => {
    const fd = makeFormData(validData);
    await createRoasterRegistration(fd);

    expect(mockGenerateSlug).toHaveBeenCalledWith(
      "Rocket Roasters",
      "Warsaw",
    );
  });

  it("calls db.roaster.create with correct fields", async () => {
    const fd = makeFormData(validData);
    await createRoasterRegistration(fd);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Rocket Roasters",
        slug: "rocket-roasters-warsaw",
        city: "Warsaw",
        country: "Poland",
        countryCode: "PL",
      }),
    });
  });

  it("calls revalidatePath for /admin/pending", async () => {
    const fd = makeFormData(validData);
    await createRoasterRegistration(fd);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/pending");
  });

  it("calls sendNewRegistrationNotification with name, city, country", async () => {
    const fd = makeFormData(validData);
    await createRoasterRegistration(fd);

    expect(mockSendNotification).toHaveBeenCalledWith({
      name: "Rocket Roasters",
      city: "Warsaw",
      country: "Poland",
    });
  });

  it("does not call db.roaster.create when validation fails", async () => {
    const fd = makeFormData({ city: "Warsaw", country: "Poland" }); // missing name
    await createRoasterRegistration(fd);

    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ── createRoasterProposal ──────────────────────────────────────────────────

describe("createRoasterProposal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateSlug.mockResolvedValue("rocket-roasters-warsaw");
    mockResolveCountryCode.mockReturnValue("PL");
    mockCreate.mockResolvedValue({ slug: "rocket-roasters-warsaw" });
  });

  it("creates PENDING roaster with no ownerId and returns slug", async () => {
    const fd = makeFormData({
      name: "Rocket Roasters",
      city: "Warsaw",
      country: "Poland",
    });
    const result = await createRoasterProposal(fd);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ slug: "rocket-roasters-warsaw" });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          name: "Rocket Roasters",
        }),
      })
    );
  });

  it("returns fieldError when name is too short", async () => {
    const fd = makeFormData({ name: "X", city: "Warsaw", country: "Poland" });
    const result = await createRoasterProposal(fd);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.name).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
