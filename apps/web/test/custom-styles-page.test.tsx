import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/styles/page";

describe("Custom Style Library page", () => {
  it("renders title, train button, 6 styles", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /custom style library/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /train new style/i })).toHaveAttribute(
      "href",
      "/manage/styles/train",
    );
    expect(screen.getAllByTestId("library-style")).toHaveLength(6);
  });
});
