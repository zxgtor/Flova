import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/home/page";

describe("HomePage", () => {
  it("renders nav, prompt bar, and at least one template card", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: "Generate" })).toHaveAttribute("href", "/studio");
    expect(screen.getByPlaceholderText(/ask flova/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /script to video/i })).toHaveAttribute(
      "href",
      "/studio?template=script_to_video",
    );
  });
});
