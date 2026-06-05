import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/community/remix/[id]/page";

describe("Remix modal page", () => {
  it("renders original video, recipe, use-this-prompt CTA", async () => {
    const ui = await Page({ params: Promise.resolve({ id: "abc" }) });
    render(ui);
    expect(screen.getByText(/original video/i)).toBeInTheDocument();
    expect(screen.getByText(/original recipe/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /use this prompt/i })).toBeInTheDocument();
  });
});
