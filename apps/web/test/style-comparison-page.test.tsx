import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/styles/compare/page";

describe("Style Comparison page", () => {
  it("renders selection sidebar, 4 comparison tiles, promote button", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /style comparison benchmark/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("comparison-tile")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /promote winner/i })).toBeInTheDocument();
  });
});
