import { describe, it, expect } from "vitest";
import { NAV_SECTIONS } from "@/lib/nav";

describe("site-map nav config", () => {
  it("encodes the four top-level sections from the site map", () => {
    expect(NAV_SECTIONS.map((s) => s.href)).toEqual([
      "/studio",
      "/manage",
      "/community",
      "/account",
    ]);
  });

  it("gives every section a label and at least one child", () => {
    for (const section of NAV_SECTIONS) {
      expect(section.label.length).toBeGreaterThan(0);
      expect(section.children.length).toBeGreaterThan(0);
    }
  });
});
