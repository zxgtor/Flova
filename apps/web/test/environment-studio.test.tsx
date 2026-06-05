import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EnvironmentPage from "@/app/studio/environment/page";

describe("Environment Studio page", () => {
  it("composes nav, geography, canvas, atmosphere", () => {
    render(<EnvironmentPage />);
    expect(
      screen.getByRole("heading", { name: /environment designer studio/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/geography & architecture/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate environment/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("reference-tile")).toHaveLength(3);
    expect(screen.getByText(/atmosphere/i)).toBeInTheDocument();
  });
});
