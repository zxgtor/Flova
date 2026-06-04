import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureGrid } from "@/components/landing/FeatureGrid";

describe("FeatureGrid", () => {
  it("renders the three landing feature cards", () => {
    render(<FeatureGrid />);
    expect(screen.getByRole("heading", { name: "Character Studio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Voice Forge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Story Canvas" })).toBeInTheDocument();
  });
});
