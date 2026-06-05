import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SceneEditor } from "@/components/studio/story/SceneEditor";

describe("SceneEditor", () => {
  it("renders the active scene title and body", () => {
    render(<SceneEditor />);
    expect(screen.getByRole("heading", { name: /call to adventure/i })).toBeInTheDocument();
    expect(screen.getByText(/ELARA/i)).toBeInTheDocument();
  });
});
