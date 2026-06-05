import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryPage from "@/app/studio/story/page";

describe("Story Studio page", () => {
  it("composes nav, structure, editor, previews, and convert bar", () => {
    render(<StoryPage />);
    expect(screen.getByRole("heading", { name: /ai story creation studio/i })).toBeInTheDocument();
    expect(screen.getByText(/act 1: the setup/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /call to adventure/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export to timeline/i })).toBeInTheDocument();
  });
});
