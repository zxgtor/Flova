import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/account/billing/page";

describe("Billing page", () => {
  it("renders plan, seats, invoices", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /team billing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upgrade plan/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("seat-row")).toHaveLength(3);
    expect(screen.getAllByTestId("invoice-row")).toHaveLength(3);
  });
});
