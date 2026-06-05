import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiCoWriter } from "@/components/studio/story/AiCoWriter";

describe("AiCoWriter", () => {
  it("renders Expand and Change Style controls", () => {
    render(<AiCoWriter />);
    expect(screen.getByRole("button", { name: /expand/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change style/i })).toBeInTheDocument();
  });
});
