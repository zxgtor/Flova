import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GenrePage from "@/app/studio/genre/page";

describe("Genre & Tone Selector page", () => {
  it("renders nav, 5 genre tiles, 3 tone sliders, apply button", () => {
    render(<GenrePage />);
    expect(screen.getByRole("heading", { name: /genre & tone/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("genre-tile")).toHaveLength(5);
    expect(screen.getByText(/mood/i)).toBeInTheDocument();
    expect(screen.getByText(/pacing/i)).toBeInTheDocument();
    expect(screen.getByText(/visual style/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply to story/i })).toBeInTheDocument();
  });
});
