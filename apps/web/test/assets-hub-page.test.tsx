import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/assets/page";

describe("Assets Hub page", () => {
  it("renders header, create button, 6 asset cards", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /assets hub/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create new asset/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("asset-card")).toHaveLength(6);
  });
});
