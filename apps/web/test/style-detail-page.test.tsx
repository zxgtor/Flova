import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StyleDetailPage from "@/app/community/marketplace/[id]/page";

describe("Style Detail page", () => {
  it("renders style content with buy and showcase", async () => {
    const ui = await StyleDetailPage({ params: Promise.resolve({ id: "s1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: /vintage kodak vibe/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buy now/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("style-showcase")).toHaveLength(3);
    expect(screen.getByText(/about the style/i)).toBeInTheDocument();
    expect(screen.getByText(/technical specs/i)).toBeInTheDocument();
  });
});
