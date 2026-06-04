import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeNav } from "@/components/home/HomeNav";

describe("HomeNav", () => {
  it("renders the four site-map sections plus Generate and Account", () => {
    render(<HomeNav />);
    expect(screen.getByRole("link", { name: "AI Studio" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: "Generate" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/account/profile",
    );
  });

  it("does not render the Sign in CTA", () => {
    render(<HomeNav />);
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });
});
