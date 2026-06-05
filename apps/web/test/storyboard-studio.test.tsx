import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryboardPage from "@/app/studio/storyboard/page";

describe("Storyboard page", () => {
  it("renders nav, 3 scenes, 5 global assets", () => {
    render(<StoryboardPage />);
    expect(screen.getByRole("heading", { name: /visual storyboard planner/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("board-scene")).toHaveLength(3);
    expect(screen.getAllByTestId("board-asset")).toHaveLength(5);
  });
});
