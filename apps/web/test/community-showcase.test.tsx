import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommunityShowcase } from "@/components/landing/CommunityShowcase";
import { SHOWCASE_ITEMS } from "@/lib/showcase";

describe("CommunityShowcase", () => {
  it("renders the section heading", () => {
    render(<CommunityShowcase />);
    expect(screen.getByRole("heading", { name: /community showcase/i })).toBeInTheDocument();
  });

  it("renders one tile per showcase item", () => {
    render(<CommunityShowcase />);
    expect(screen.getAllByTestId("showcase-tile")).toHaveLength(SHOWCASE_ITEMS.length);
  });
});
