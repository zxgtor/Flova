import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConvertBar } from "@/components/studio/story/ConvertBar";

describe("ConvertBar", () => {
  it("renders Convert and Export actions and the readiness percentage", () => {
    render(<ConvertBar />);
    expect(screen.getByRole("button", { name: /convert to video/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export to timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });
});
