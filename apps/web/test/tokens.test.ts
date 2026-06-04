import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

describe("brand tokens", () => {
  it("defines all brand CSS variables", () => {
    for (const token of [
      "--bg",
      "--surface",
      "--surface-2",
      "--border",
      "--text",
      "--muted",
      "--gold",
      "--gold-bright",
      "--gold-deep",
    ]) {
      expect(css).toContain(`${token}:`);
    }
  });
});
