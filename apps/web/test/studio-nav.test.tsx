import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioNav } from "@/components/studio/StudioNav";

describe("StudioNav", () => {
  it("renders the studio title and back link to /home", () => {
    render(<StudioNav title="AI Story Creation Studio" />);
    expect(screen.getByRole("heading", { name: /ai story creation studio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/home");
  });

  it("renders Projects / Collaboration / Settings links", () => {
    render(<StudioNav title="x" />);
    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute(
      "href",
      "/manage/projects",
    );
    expect(screen.getByRole("link", { name: /collaboration/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/account/settings",
    );
  });
});
