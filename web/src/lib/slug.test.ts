import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("converts simple name to slug", () => {
    expect(slugify("Hard Beans")).toBe("hard-beans");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Świeżo")).toBe("cafe-swiezo");
  });

  it("handles special characters", () => {
    expect(slugify("Café & Co.")).toBe("cafe-co");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("one   two   three")).toBe("one-two-three");
  });

  it("truncates to 80 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBe(80);
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("handles numbers", () => {
    expect(slugify("Coffee 42")).toBe("coffee-42");
  });

  it("handles unicode beyond diacritics", () => {
    expect(slugify("Rösterei München")).toBe("rosterei-munchen");
  });
});
