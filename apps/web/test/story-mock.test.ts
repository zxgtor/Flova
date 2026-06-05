import { describe, it, expect } from "vitest";
import { STORY } from "@/lib/story-mock";

describe("story mock", () => {
  it("contains 3 acts with at least one scene each", () => {
    expect(STORY.acts).toHaveLength(3);
    for (const act of STORY.acts) expect(act.scenes.length).toBeGreaterThan(0);
  });
  it("flags the first scene as active", () => {
    const first = STORY.acts[0]!.scenes[0]!;
    expect(first.active).toBe(true);
  });
});
