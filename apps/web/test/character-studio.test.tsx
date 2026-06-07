import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    token: "tok",
    user: { id: "u1", email: "a@b.co", display_name: "", created_at: "" },
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    listPresets: vi.fn().mockResolvedValue([]),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
    submitRender: vi.fn(),
  },
}));

import CharacterPage from "@/app/studio/character/page";

describe("Character Studio page", () => {
  it("composes nav, attributes, portrait, variants, Save button", () => {
    render(<CharacterPage />);
    expect(
      screen.getByRole("heading", { name: /character design studio/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/character attributes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/portrait preview/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("variant-tile")).toHaveLength(4);
  });
});
