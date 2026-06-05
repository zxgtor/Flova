import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioSelector } from "@/components/studio/StudioSelector";

describe("StudioSelector", () => {
  it("renders all 7 studios with the Story card linking to /studio/story", () => {
    render(<StudioSelector />);
    expect(screen.getAllByTestId("studio-card")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /story creation/i })).toHaveAttribute(
      "href",
      "/studio/story",
    );
  });

  it("renders unavailable studios as non-links labelled Coming soon", () => {
    render(<StudioSelector />);
    const comingSoon = screen.getAllByText(/coming soon/i);
    expect(comingSoon.length).toBeGreaterThan(0);
    // available studios render as links
    expect(screen.getByRole("link", { name: /character design/i })).toHaveAttribute(
      "href",
      "/studio/character",
    );
  });
});
