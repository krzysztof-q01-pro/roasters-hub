import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must be hoisted above imports) ──────────────────────────────────

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    roaster: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendRoasterVerifiedEmail: vi.fn(),
  sendRoasterRejectedEmail: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  sendRoasterVerifiedEmail,
  sendRoasterRejectedEmail,
} from "@/lib/email";
import { verifyRoaster, rejectRoaster } from "@/actions/admin.actions";

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockUpdate = db.roaster.update as unknown as ReturnType<typeof vi.fn>;
const mockSendVerified = vi.mocked(sendRoasterVerifiedEmail);
const mockSendRejected = vi.mocked(sendRoasterRejectedEmail);

// ── verifyRoaster ──────────────────────────────────────────────────────────

describe("verifyRoaster", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error when user is not admin", async () => {
    mockRequireAdmin.mockRejectedValue(
      new Error("Forbidden: admin role required"),
    );

    const result = await verifyRoaster("roaster-1");

    expect(result).toEqual({
      success: false,
      error: "Forbidden: admin role required",
    });
  });

  it("returns success with slug on valid admin request", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: null,
    });

    const result = await verifyRoaster("roaster-1");

    expect(result).toEqual({ success: true, data: { slug: "test-roaster" } });
  });

  it("calls db.roaster.update with VERIFIED status and clears rejection fields", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: null,
    });

    await verifyRoaster("roaster-1");

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "roaster-1" },
      data: {
        status: "VERIFIED",
        verifiedAt: expect.any(Date),
        rejectedAt: null,
        rejectedReason: null,
      },
      select: { slug: true, name: true, email: true },
    });
  });

  it("revalidates all required paths", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "my-roaster",
      name: "My Roaster",
      email: null,
    });

    await verifyRoaster("roaster-1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/roasters");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/roasters/my-roaster");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/pending");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/map");
  });

  it("sends verification email when roaster has an email", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: "owner@example.com",
    });

    await verifyRoaster("roaster-1");

    expect(mockSendVerified).toHaveBeenCalledWith({
      email: "owner@example.com",
      name: "Test Roaster",
      slug: "test-roaster",
    });
  });

  it("skips verification email when roaster has no email", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: null,
    });

    await verifyRoaster("roaster-1");

    expect(mockSendVerified).not.toHaveBeenCalled();
  });
});

// ── rejectRoaster ──────────────────────────────────────────────────────────

describe("rejectRoaster", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error when user is not admin", async () => {
    mockRequireAdmin.mockRejectedValue(
      new Error("Forbidden: admin role required"),
    );

    const result = await rejectRoaster("roaster-1", "Incomplete info");

    expect(result).toEqual({
      success: false,
      error: "Forbidden: admin role required",
    });
  });

  it("returns success on valid admin request", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: null,
    });

    const result = await rejectRoaster("roaster-1", "Incomplete info");

    expect(result).toEqual({ success: true, data: undefined });
  });

  it("calls db.roaster.update with REJECTED status and reason", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: null,
    });

    await rejectRoaster("roaster-1", "Missing website");

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "roaster-1" },
      data: {
        status: "REJECTED",
        rejectedAt: expect.any(Date),
        rejectedReason: "Missing website",
      },
      select: { slug: true, name: true, email: true },
    });
  });

  it("revalidates all required paths", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "my-roaster",
      name: "My Roaster",
      email: null,
    });

    await rejectRoaster("roaster-1", "reason");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/roasters");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/roasters/my-roaster");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/pending");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/map");
  });

  it("sends rejection email with reason when roaster has an email", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: "owner@example.com",
    });

    await rejectRoaster("roaster-1", "Missing website");

    expect(mockSendRejected).toHaveBeenCalledWith({
      email: "owner@example.com",
      name: "Test Roaster",
      reason: "Missing website",
    });
  });

  it("skips rejection email when roaster has no email", async () => {
    mockRequireAdmin.mockResolvedValue("admin-1");
    mockUpdate.mockResolvedValue({
      slug: "test-roaster",
      name: "Test Roaster",
      email: null,
    });

    await rejectRoaster("roaster-1", "reason");

    expect(mockSendRejected).not.toHaveBeenCalled();
  });
});
