import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    token: "tok",
    user: { id: "u1", email: "a@b.co", display_name: "", created_at: "" },
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import GenrePage from "@/app/studio/genre/page";

describe("Genre & Tone Selector page", () => {
  it("renders nav, 5 genre tiles, 3 tone sliders, apply button", () => {
    render(<GenrePage />);
    expect(screen.getByRole("heading", { name: /genre & tone/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("genre-tile")).toHaveLength(5);
    expect(screen.getByText("Mood")).toBeInTheDocument();
    expect(screen.getByText("Pacing")).toBeInTheDocument();
    expect(screen.getByText("Visual Style")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply to story/i })).toBeInTheDocument();
  });
});
