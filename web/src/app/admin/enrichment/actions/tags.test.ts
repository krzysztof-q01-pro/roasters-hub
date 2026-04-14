import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    enrichmentTag: {
      upsert: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEnrichmentTags, upsertEnrichmentTag, deleteEnrichmentTag } from "./tags";

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockFindMany = db.enrichmentTag.findMany as ReturnType<typeof vi.fn>;
const mockUpsert = db.enrichmentTag.upsert as ReturnType<typeof vi.fn>;
const mockDelete = db.enrichmentTag.delete as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe("getEnrichmentTags", () => {
  it("returns tags for entity type", async () => {
    mockRequireAdmin.mockResolvedValue("admin-user-id");
    mockFindMany.mockResolvedValue([{ id: "1", entityType: "CAFE", value: "specialty coffee" }]);

    const result = await getEnrichmentTags("CAFE");

    expect(result).toEqual({ success: true, data: [{ id: "1", entityType: "CAFE", value: "specialty coffee" }] });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { entityType: "CAFE" },
      orderBy: { createdAt: "asc" },
    });
  });
});

describe("upsertEnrichmentTag", () => {
  it("creates tag and returns it", async () => {
    mockRequireAdmin.mockResolvedValue("admin-user-id");
    mockUpsert.mockResolvedValue({ id: "2", entityType: "CAFE", value: "third wave" });

    const result = await upsertEnrichmentTag("CAFE", "third wave");

    expect(result).toEqual({ success: true, data: { id: "2", entityType: "CAFE", value: "third wave" } });
  });

  it("rejects empty value", async () => {
    mockRequireAdmin.mockResolvedValue("admin-user-id");
    const result = await upsertEnrichmentTag("CAFE", "  ");
    expect(result).toEqual({ success: false, error: "Tag value cannot be empty" });
  });
});

describe("deleteEnrichmentTag", () => {
  it("deletes tag by entityType + value", async () => {
    mockRequireAdmin.mockResolvedValue("admin-user-id");
    mockDelete.mockResolvedValue({ id: "1" });

    const result = await deleteEnrichmentTag("CAFE", "specialty coffee");

    expect(result).toEqual({ success: true, data: undefined });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { entityType_value: { entityType: "CAFE", value: "specialty coffee" } },
    });
  });
});
