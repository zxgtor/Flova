import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/Hero";

describe("Hero", () => {
  it("renders the headline and primary CTA", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /forge your imagination into motion/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start forging/i })).toHaveAttribute(
      "href",
      "/home",
    );
  });
});
