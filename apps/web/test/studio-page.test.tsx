import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioPage from "@/app/studio/page";

describe("StudioPage", () => {
  it("renders the studio selector when no params", async () => {
    const ui = await StudioPage({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getAllByTestId("studio-card")).toHaveLength(7);
  });

  it("renders the Starting From banner when prompt is given", async () => {
    const ui = await StudioPage({ searchParams: Promise.resolve({ prompt: "hello" }) });
    render(ui);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });
});
