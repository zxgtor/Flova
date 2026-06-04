import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/home/Avatar";

describe("Avatar", () => {
  it("links to the profile page", () => {
    render(<Avatar />);
    expect(screen.getByRole("link", { name: /account/i })).toHaveAttribute(
      "href",
      "/account/profile",
    );
  });
});
