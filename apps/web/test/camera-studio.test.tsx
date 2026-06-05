import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CameraPage from "@/app/studio/camera/page";

describe("Camera & Lighting page", () => {
  it("renders nav, 8 presets total, custom section", () => {
    render(<CameraPage />);
    expect(screen.getByRole("heading", { name: /camera & light/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("preset-tile")).toHaveLength(8);
    expect(screen.getByRole("button", { name: /save new custom preset/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("custom-preset")).toHaveLength(1);
  });
});
