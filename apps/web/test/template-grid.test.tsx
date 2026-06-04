import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateGrid } from "@/components/home/TemplateGrid";
import { TEMPLATES } from "@/lib/templates";

describe("TemplateGrid", () => {
  it("renders one card per template, each linking to /studio?template=<slug>", () => {
    render(<TemplateGrid />);
    for (const t of TEMPLATES) {
      const link = screen.getByRole("link", { name: new RegExp(t.title, "i") });
      expect(link).toHaveAttribute("href", `/studio?template=${t.slug}`);
    }
  });

  it("marks popular templates with a Popular badge", () => {
    render(<TemplateGrid />);
    expect(screen.getAllByText(/popular/i)).toHaveLength(
      TEMPLATES.filter((t) => t.popular).length,
    );
  });
});
