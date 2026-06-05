import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarketplacePage from "@/app/community/marketplace/page";

describe("Marketplace page", () => {
  it("renders filters, banner, tabs, 4 style cards", () => {
    render(<MarketplacePage />);
    expect(screen.getByRole("heading", { name: /style of the month/i })).toBeInTheDocument();
    expect(screen.getByText(/category/i)).toBeInTheDocument();
    expect(screen.getByText(/top sellers/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("style-card")).toHaveLength(4);
  });
});
