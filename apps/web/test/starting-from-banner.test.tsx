import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StartingFromBanner } from "@/components/studio/StartingFromBanner";

describe("StartingFromBanner", () => {
  it("renders nothing when no prompt and no template", () => {
    const { container } = render(<StartingFromBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the prompt when given", () => {
    render(<StartingFromBanner prompt="a cat in space" />);
    expect(screen.getByText(/a cat in space/i)).toBeInTheDocument();
  });

  it("shows the template label when given", () => {
    render(<StartingFromBanner template="script_to_video" />);
    expect(screen.getByText(/script_to_video/i)).toBeInTheDocument();
  });
});
