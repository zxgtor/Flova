import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/styles/train/page";

describe("Style Training page", () => {
  it("renders three columns and begin training button", () => {
    render(<Page />);
    expect(screen.getByText(/upload training data/i)).toBeInTheDocument();
    expect(screen.getByText(/training configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/training status/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /begin training/i })).toBeInTheDocument();
  });
});
