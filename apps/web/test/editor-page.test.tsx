import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/editor/page";

describe("Editor page", () => {
  it("renders asset library, timeline tracks, properties", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /video editing workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/asset library/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("editor-asset")).toHaveLength(5);
    expect(screen.getAllByTestId("timeline-track")).toHaveLength(5);
    expect(screen.getByText(/ai enhancements/i)).toBeInTheDocument();
  });
});
