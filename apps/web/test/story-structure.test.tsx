import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoryStructure } from "@/components/studio/story/StoryStructure";

describe("StoryStructure", () => {
  it("lists the three acts", () => {
    render(<StoryStructure />);
    expect(screen.getByText(/act 1: the setup/i)).toBeInTheDocument();
    expect(screen.getByText(/act 2/i)).toBeInTheDocument();
    expect(screen.getByText(/act 3/i)).toBeInTheDocument();
  });
  it("highlights the active scene", () => {
    render(<StoryStructure />);
    const active = screen.getByTestId("active-scene");
    expect(active).toHaveTextContent(/call to adventure/i);
  });
});
