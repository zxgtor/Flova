import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
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
    listPresets: vi.fn().mockResolvedValue([
      {
        id: "s1",
        kind: "style",
        name: "Ghibli Watercolor",
        payload: {
          description: "Soft hand-painted look",
          prompt_template: "{prompt}, studio ghibli style, vibrant colors",
        },
        is_public: false,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "s2",
        kind: "style",
        name: "Cyberpunk Noir",
        payload: { prompt_template: "{prompt}, neon noir, rain-slick streets" },
        is_public: false,
        created_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
    ]),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
  },
}));

import Page from "@/app/manage/styles/page";

describe("Style Library page", () => {
  it("renders header, train + compare actions, save form, and real style cards", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /style library/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /train new style/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^compare$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save style/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("style-card")).toHaveLength(2));
    expect(screen.getByText(/ghibli watercolor/i)).toBeInTheDocument();
  });
});
