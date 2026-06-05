import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/team/page";

describe("Team Workspace page", () => {
  it("renders title, 5 project cards, activity feed", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /shared team workspace/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("team-project")).toHaveLength(5);
    expect(screen.getByText(/team activity feed/i)).toBeInTheDocument();
  });
});
