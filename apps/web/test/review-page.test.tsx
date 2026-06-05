import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/export/review/[id]/page";

describe("Review & Export page", () => {
  it("renders project, timeline, publish CTA", async () => {
    const ui = await Page({ params: Promise.resolve({ id: "x" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: /final movie review/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("timeline-item")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /final export & publish/i })).toBeInTheDocument();
  });
});
