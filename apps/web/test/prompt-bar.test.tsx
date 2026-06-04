import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromptBar } from "@/components/home/PromptBar";

describe("PromptBar", () => {
  it("submits a GET form to /studio", () => {
    const { container } = render(<PromptBar />);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.getAttribute("action")).toBe("/studio");
    expect(form!.getAttribute("method")?.toLowerCase()).toBe("get");
  });

  it("has a prompt input named 'prompt' with the Flova placeholder", () => {
    render(<PromptBar />);
    const input = screen.getByPlaceholderText(/ask flova/i) as HTMLInputElement;
    expect(input.name).toBe("prompt");
  });

  it("has an accessible submit button", () => {
    render(<PromptBar />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});
