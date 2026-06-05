import { describe, it, expect } from "vitest";
import { STUDIOS, getStudio } from "@/lib/studios";

describe("studios registry", () => {
  it("lists all seven studios with unique slugs", () => {
    const slugs = STUDIOS.map((s) => s.slug);
    expect(slugs).toHaveLength(7);
    expect(new Set(slugs).size).toBe(7);
  });

  it("marks story and character as available", () => {
    expect(STUDIOS.find((s) => s.slug === "story")?.available).toBe(true);
    expect(STUDIOS.find((s) => s.slug === "character")?.available).toBe(true);
  });

  it("getStudio returns matching studio or undefined", () => {
    expect(getStudio("story")?.label).toBe("Story Creation");
    expect(getStudio("nope")).toBeUndefined();
  });
});
