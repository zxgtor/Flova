import { describe, it, expect } from "vitest";
import { TEMPLATES } from "@/lib/templates";

describe("home templates", () => {
  it("exposes exactly four templates", () => {
    expect(TEMPLATES).toHaveLength(4);
  });

  it("each template has slug, title, description, image, and popular=true", () => {
    for (const t of TEMPLATES) {
      expect(t.slug).toMatch(/^[a-z_]+$/);
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.image.startsWith("/mockups/templates/")).toBe(true);
      expect(t.popular).toBe(true);
    }
  });

  it("slugs are unique", () => {
    const slugs = TEMPLATES.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
