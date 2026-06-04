import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/landing/SiteNav";

describe("SiteNav", () => {
  it("renders the logo and a Sign in action", () => {
    render(<SiteNav />);
    expect(screen.getByText("Flova")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders a link for each top-level section", () => {
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: "AI Studio" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/community");
  });

  it("renders a cta slot when provided and hides the default sign-in", () => {
    render(<SiteNav cta={<a href="/account/profile">Custom CTA</a>} />);
    expect(screen.getByRole("link", { name: /custom cta/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });
});
