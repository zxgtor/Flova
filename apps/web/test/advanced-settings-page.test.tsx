import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/styles/settings/page";

describe("Advanced Settings page", () => {
  it("renders camera/lighting/enhancement and apply button", () => {
    render(<Page />);
    expect(screen.getByText(/camera movement/i)).toBeInTheDocument();
    expect(screen.getByText(/lighting & mood/i)).toBeInTheDocument();
    expect(screen.getByText(/enhancement options/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply changes/i })).toBeInTheDocument();
  });
});
