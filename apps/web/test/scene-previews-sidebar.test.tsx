import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScenePreviewsSidebar } from "@/components/studio/story/ScenePreviewsSidebar";

describe("ScenePreviewsSidebar", () => {
  it("renders preview tiles for scenes that have images", () => {
    render(<ScenePreviewsSidebar />);
    const tiles = screen.getAllByTestId("scene-preview");
    expect(tiles.length).toBeGreaterThanOrEqual(3);
  });
});
