import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/render/page";

describe("Batch Render page", () => {
  it("renders dashboard stats, controls, queue rows", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /batch render dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start batch/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("render-row")).toHaveLength(6);
  });
});
