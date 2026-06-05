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

  it("renders available studios as links to their pages", () => {
    render(<StudioSelector />);
    expect(screen.getByRole("link", { name: /character design/i })).toHaveAttribute(
      "href",
      "/studio/character",
    );
    expect(screen.getByRole("link", { name: /environment/i })).toHaveAttribute(
      "href",
      "/studio/environment",
    );
  });
});
