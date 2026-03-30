import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must be hoisted above imports) ──────────────────────────────────

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    userProfile: {
      upsert: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
    },
  },
}));

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireAuth, requireAdmin, requireRoasterOwner } from "@/lib/auth";

const mockAuth = vi.mocked(auth);
const mockCurrentUser = vi.mocked(currentUser);
// Cast through unknown to access the vi.fn() mock — standard pattern for Prisma delegates
const mockUpsert = db.userProfile.upsert as unknown as ReturnType<
  typeof vi.fn
>;
const mockFindUnique = db.userProfile.findUnique as unknown as ReturnType<
  typeof vi.fn
>;

// ── requireAuth ────────────────────────────────────────────────────────────

describe("requireAuth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 'Unauthorized' when not signed in", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    await expect(requireAuth()).rejects.toThrow("Unauthorized: not signed in");
  });

  it("returns userId when user is signed in", async () => {
    mockAuth.mockResolvedValue({ userId: "user-abc" } as never);
    await expect(requireAuth()).resolves.toBe("user-abc");
  });
});

// ── requireAdmin ───────────────────────────────────────────────────────────

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({} as never);
  });

  it("throws 'Unauthorized' when not signed in", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    await expect(requireAdmin()).rejects.toThrow("Unauthorized: not signed in");
  });

  it("throws 'Forbidden' when user has no role metadata", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockCurrentUser.mockResolvedValue({
      publicMetadata: {},
      emailAddresses: [{ emailAddress: "user@example.com" }],
    } as never);
    await expect(requireAdmin()).rejects.toThrow(
      "Forbidden: admin role required",
    );
  });

  it("throws 'Forbidden' when user has ROASTER role", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "ROASTER" },
      emailAddresses: [{ emailAddress: "roaster@example.com" }],
    } as never);
    await expect(requireAdmin()).rejects.toThrow(
      "Forbidden: admin role required",
    );
  });

  it("throws 'Forbidden' when user has CAFE role", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "CAFE" },
      emailAddresses: [{ emailAddress: "cafe@example.com" }],
    } as never);
    await expect(requireAdmin()).rejects.toThrow(
      "Forbidden: admin role required",
    );
  });

  it("returns userId when user has ADMIN role", async () => {
    mockAuth.mockResolvedValue({ userId: "admin-456" } as never);
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "ADMIN" },
      emailAddresses: [{ emailAddress: "admin@example.com" }],
    } as never);
    await expect(requireAdmin()).resolves.toBe("admin-456");
  });

  it("upserts UserProfile with ADMIN role after auth check", async () => {
    mockAuth.mockResolvedValue({ userId: "admin-456" } as never);
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "ADMIN" },
      emailAddresses: [{ emailAddress: "admin@example.com" }],
    } as never);
    await requireAdmin();
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { id: "admin-456" },
      update: { email: "admin@example.com", role: "ADMIN" },
      create: { id: "admin-456", email: "admin@example.com", role: "ADMIN" },
    });
  });

  it("uses empty string email when user has no email addresses", async () => {
    mockAuth.mockResolvedValue({ userId: "admin-789" } as never);
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "ADMIN" },
      emailAddresses: [],
    } as never);
    await requireAdmin();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ email: "" }),
      }),
    );
  });
});

// ── requireRoasterOwner ────────────────────────────────────────────────────

describe("requireRoasterOwner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 'Unauthorized' when not signed in", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    await expect(requireRoasterOwner("roaster-1")).rejects.toThrow(
      "Unauthorized: not signed in",
    );
  });

  it("throws 'Forbidden' when UserProfile does not exist", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockFindUnique.mockResolvedValue(null);
    await expect(requireRoasterOwner("roaster-1")).rejects.toThrow(
      "Forbidden: not the owner of this roaster",
    );
  });

  it("throws 'Forbidden' when user owns a different roaster", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockFindUnique.mockResolvedValue({ roasterId: "roaster-other" });
    await expect(requireRoasterOwner("roaster-1")).rejects.toThrow(
      "Forbidden: not the owner of this roaster",
    );
  });

  it("throws 'Forbidden' when user has no roaster assigned (null roasterId)", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockFindUnique.mockResolvedValue({ roasterId: null });
    await expect(requireRoasterOwner("roaster-1")).rejects.toThrow(
      "Forbidden: not the owner of this roaster",
    );
  });

  it("returns userId when user is the owner of the roaster", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockFindUnique.mockResolvedValue({ roasterId: "roaster-1" });
    await expect(requireRoasterOwner("roaster-1")).resolves.toBe("user-123");
  });

  it("queries UserProfile by userId", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as never);
    mockFindUnique.mockResolvedValue({ roasterId: "roaster-1" });
    await requireRoasterOwner("roaster-1");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "user-123" },
      select: { roasterId: true },
    });
  });
});
