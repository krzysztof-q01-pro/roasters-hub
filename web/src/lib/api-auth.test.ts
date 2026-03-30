import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
  db: {
    apiKey: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { db } from "@/lib/db";
import { validateApiKey, isErrorResponse } from "@/lib/api-auth";

// Cast through unknown to access the vi.fn() mock — standard pattern for Prisma delegates
const mockFindUnique = db.apiKey.findUnique as unknown as ReturnType<
  typeof vi.fn
>;
const mockUpdate = db.apiKey.update as unknown as ReturnType<typeof vi.fn>;

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) {
    headers["authorization"] = authHeader;
  }
  return new Request("http://localhost/api/v1/roasters", { headers });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("validateApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  it("returns 401 when Authorization header is missing", async () => {
    const result = await validateApiKey(makeRequest());
    expect(isErrorResponse(result)).toBe(true);
  });

  it("returns 401 when Authorization header uses Basic scheme", async () => {
    const result = await validateApiKey(makeRequest("Basic abc123"));
    expect(isErrorResponse(result)).toBe(true);
  });

  it("returns 401 when Authorization header has no scheme", async () => {
    const result = await validateApiKey(makeRequest("just-a-key"));
    expect(isErrorResponse(result)).toBe(true);
  });

  it("returns 401 when key does not exist in database", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await validateApiKey(makeRequest("Bearer nonexistent-key"));
    expect(isErrorResponse(result)).toBe(true);
  });

  it("queries db with active:true so inactive keys are rejected automatically", async () => {
    mockFindUnique.mockResolvedValue(null); // inactive key → findUnique returns null
    await validateApiKey(makeRequest("Bearer inactive-key"));
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { key: "inactive-key", active: true },
      select: { id: true, name: true },
    });
  });

  it("returns key record when valid active key is provided", async () => {
    mockFindUnique.mockResolvedValue({ id: "key-1", name: "Test Partner" });
    const result = await validateApiKey(makeRequest("Bearer valid-key"));
    expect(isErrorResponse(result)).toBe(false);
    expect(result).toEqual({ id: "key-1", name: "Test Partner" });
  });

  it("triggers lastUsed update after returning valid key", async () => {
    mockFindUnique.mockResolvedValue({ id: "key-1", name: "Test Partner" });
    await validateApiKey(makeRequest("Bearer valid-key"));
    // Fire-and-forget — flush microtasks
    await new Promise((r) => setTimeout(r, 0));
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "key-1" },
      data: { lastUsed: expect.any(Date) },
    });
  });
});

describe("isErrorResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for a NextResponse error (missing header)", async () => {
    const result = await validateApiKey(makeRequest());
    expect(isErrorResponse(result)).toBe(true);
  });

  it("returns false for a valid key record", async () => {
    mockFindUnique.mockResolvedValue({ id: "key-1", name: "Partner" });
    const result = await validateApiKey(makeRequest("Bearer valid-key"));
    expect(isErrorResponse(result)).toBe(false);
  });
});
