import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("LandingPage", () => {
  it("composes nav, hero, features, and showcase", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /forge your imagination into motion/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Character Studio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /community showcase/i })).toBeInTheDocument();
  });
});
