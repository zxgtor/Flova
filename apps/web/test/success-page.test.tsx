import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/export/success/[id]/page";

describe("Publish Success page", () => {
  it("renders complete heading, 2 download formats, 4 socials, start new", async () => {
    const ui = await Page({ params: Promise.resolve({ id: "x" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: /production complete/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("download-format")).toHaveLength(2);
    expect(screen.getAllByTestId("share-target")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /start new project/i })).toHaveAttribute("href", "/home");
  });
});
