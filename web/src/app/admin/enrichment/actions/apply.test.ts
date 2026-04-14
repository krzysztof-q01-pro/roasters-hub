import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    enrichmentProposal: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    cafe: { upsert: vi.fn(), update: vi.fn(), create: vi.fn() },
    roaster: { update: vi.fn(), create: vi.fn() },
    enrichmentRun: { findUnique: vi.fn() },
  },
}));

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { applyEntityProposals } from "./apply";

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockFindMany = db.enrichmentProposal.findMany as ReturnType<typeof vi.fn>;
const mockUpdateMany = db.enrichmentProposal.updateMany as ReturnType<typeof vi.fn>;
const mockCafeUpdate = db.cafe.update as ReturnType<typeof vi.fn>;
const mockRevalidatePath = vi.mocked(revalidatePath);

beforeEach(() => vi.clearAllMocks());

describe("applyEntityProposals", () => {
  it("applies PENDING proposals for a specific existing entity", async () => {
    mockRequireAdmin.mockResolvedValue("admin-user-id");
    mockFindMany.mockResolvedValue([
      {
        id: "p1",
        entityId: "cafe-1",
        entityType: "CAFE",
        entityName: "Test Cafe",
        fieldKey: "website",
        proposedValue: "https://test.com",
        status: "PENDING",
        changeType: "FILL",
      },
    ]);
    mockCafeUpdate.mockResolvedValue({});
    mockUpdateMany.mockResolvedValue({ count: 1 });

    const result = await applyEntityProposals({
      runId: "run-1",
      entityId: "cafe-1",
      entityName: "Test Cafe",
      entityType: "CAFE",
    });

    expect(result).toEqual({ success: true, data: { applied: 1 } });
    expect(mockCafeUpdate).toHaveBeenCalledWith({
      where: { id: "cafe-1" },
      data: { website: "https://test.com" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/cafes");
  });

  it("returns zero when no pending proposals", async () => {
    mockRequireAdmin.mockResolvedValue("admin-user-id");
    mockFindMany.mockResolvedValue([]);

    const result = await applyEntityProposals({
      runId: "run-1",
      entityId: "cafe-1",
      entityName: "Test Cafe",
      entityType: "CAFE",
    });

    expect(result).toEqual({ success: true, data: { applied: 0 } });
  });
});
