import { describe, it, expect } from "vitest";
import { CHARACTER } from "@/lib/character-mock";

describe("character mock", () => {
  it("has 2 attribute groups and 4 variants", () => {
    expect(CHARACTER.groups).toHaveLength(2);
    expect(CHARACTER.variants).toHaveLength(4);
  });
});
