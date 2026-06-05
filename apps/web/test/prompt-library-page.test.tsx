import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/prompts/page";

describe("Prompt Library page", () => {
  it("renders title, search, 3 prompt cards", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /prompt library/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search saved prompts/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("prompt-card")).toHaveLength(3);
  });
});
