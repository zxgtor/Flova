import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";

describe("Logo", () => {
  it("renders the wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("Flova")).toBeInTheDocument();
  });

  it("renders an accessible logo mark", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: /flova/i })).toBeInTheDocument();
  });

  it("can hide the wordmark", () => {
    render(<Logo wordmark={false} />);
    expect(screen.queryByText("Flova")).not.toBeInTheDocument();
  });
});
