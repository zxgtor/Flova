import { describe, it, expect } from "vitest";
import {
  composePromptWithDefaults,
  DEFAULT_RENDER_DEFAULTS,
  type RenderDefaults,
} from "@/lib/render-defaults";

describe("composePromptWithDefaults", () => {
  it("returns the prompt unchanged with bare defaults", () => {
    expect(composePromptWithDefaults("a cat", DEFAULT_RENDER_DEFAULTS)).toBe("a cat");
  });

  it("appends cinematic lighting + mood + negative prompt", () => {
    const v: RenderDefaults = {
      ...DEFAULT_RENDER_DEFAULTS,
      lighting: "cinematic",
      mood: "moody",
      negative_prompt: "blurry, watermark",
    };
    expect(composePromptWithDefaults("a cat", v)).toBe(
      "a cat, cinematic lighting, moody mood, (avoid: blurry, watermark)",
    );
  });

  it("skips empty fields", () => {
    const v: RenderDefaults = {
      ...DEFAULT_RENDER_DEFAULTS,
      lighting: "golden_hour",
    };
    expect(composePromptWithDefaults("a cat", v)).toBe(
      "a cat, golden hour lighting",
    );
  });
});
