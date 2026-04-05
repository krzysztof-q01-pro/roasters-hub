import { describe, it, expect } from "vitest";
import { filterByCert, filterByService } from "../map-filters";

describe("filterByCert", () => {
  const items = [
    { id: "1", certifications: ["DIRECT_TRADE", "ORGANIC"] },
    { id: "2", certifications: ["ORGANIC"] },
    { id: "3", certifications: [] },
  ];

  it("returns all items when cert is null", () => {
    expect(filterByCert(items, null)).toHaveLength(3);
  });

  it("filters by DIRECT_TRADE", () => {
    const result = filterByCert(items, "DIRECT_TRADE");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by ORGANIC", () => {
    const result = filterByCert(items, "ORGANIC");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterByCert(items, "RAINFOREST_ALLIANCE")).toHaveLength(0);
  });
});

describe("filterByService", () => {
  const items = [
    { id: "1", services: ["Free Wi-Fi", "Laptop Friendly"] },
    { id: "2", services: ["Vegan Options"] },
    { id: "3", services: [] },
  ];

  it("returns all items when service is null", () => {
    expect(filterByService(items, null)).toHaveLength(3);
  });

  it("filters by Free Wi-Fi", () => {
    const result = filterByService(items, "Free Wi-Fi");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterByService(items, "Dog Friendly")).toHaveLength(0);
  });
});
