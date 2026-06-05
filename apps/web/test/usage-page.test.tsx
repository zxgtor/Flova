import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/account/usage/page";

describe("Usage Report page", () => {
  it("renders 3 stats, breakdown, 5 activity rows", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /usage & credit report/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("usage-stat")).toHaveLength(3);
    expect(screen.getAllByTestId("log-row")).toHaveLength(5);
  });
});
