import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/research/page";

describe("Research Hub page", () => {
  it("renders search, discovery, library, project inbox", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /asset research hub/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze with ai/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("discovery-tile")).toHaveLength(5);
    expect(screen.getAllByTestId("library-tile")).toHaveLength(4);
  });
});
