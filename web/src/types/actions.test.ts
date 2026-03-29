import { describe, it, expect } from "vitest";
import { CreateRoasterSchema, CreateReviewSchema } from "./actions";

describe("CreateRoasterSchema", () => {
  const validInput = {
    name: "Hard Beans",
    country: "Poland",
    city: "Opole",
  };

  it("accepts valid minimal input", () => {
    const result = CreateRoasterSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts valid full input", () => {
    const result = CreateRoasterSchema.safeParse({
      ...validInput,
      description: "Great roaster",
      website: "https://hardbeans.pl",
      email: "hello@hardbeans.pl",
      instagram: "@hardbeans",
      shopUrl: "https://shop.hardbeans.pl",
      certifications: ["ORGANIC", "FAIR_TRADE"],
      origins: ["Ethiopia", "Colombia"],
      roastStyles: ["Light", "Filter"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = CreateRoasterSchema.safeParse({
      country: "Poland",
      city: "Opole",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = CreateRoasterSchema.safeParse({
      ...validInput,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = CreateRoasterSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty optional email", () => {
    const result = CreateRoasterSchema.safeParse({
      ...validInput,
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid website URL", () => {
    const result = CreateRoasterSchema.safeParse({
      ...validInput,
      website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid instagram handle", () => {
    const result = CreateRoasterSchema.safeParse({
      ...validInput,
      instagram: "has spaces and $pecial",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateReviewSchema", () => {
  const validReview = {
    roasterId: "clx123abc",
    authorName: "Jan Kowalski",
    rating: 4,
  };

  it("accepts valid review", () => {
    const result = CreateReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("accepts review with comment", () => {
    const result = CreateReviewSchema.safeParse({
      ...validReview,
      comment: "Great coffee!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = CreateReviewSchema.safeParse({
      ...validReview,
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = CreateReviewSchema.safeParse({
      ...validReview,
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing roasterId", () => {
    const result = CreateReviewSchema.safeParse({
      authorName: "Jan",
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects short author name", () => {
    const result = CreateReviewSchema.safeParse({
      ...validReview,
      authorName: "J",
    });
    expect(result.success).toBe(false);
  });
});
