import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CharacterPage from "@/app/studio/character/page";

describe("Character Studio page", () => {
  it("composes nav, attributes, portrait, variants", () => {
    render(<CharacterPage />);
    expect(
      screen.getByRole("heading", { name: /character design studio/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/character attributes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/portrait preview/i)).toBeInTheDocument();
    expect(screen.getByText(/character variants/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save character/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("variant-tile")).toHaveLength(4);
  });
});
