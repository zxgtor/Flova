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
        name: "Ghibli",
        payload: { prompt_template: "{prompt}, ghibli" },
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "s2",
        kind: "style",
        name: "Cyberpunk",
        payload: { prompt_template: "{prompt}, cyberpunk" },
        created_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
    ]),
    submitRender: vi.fn(),
    getRender: vi.fn(),
  },
}));

import Page from "@/app/manage/styles/compare/page";

describe("Style Comparison page", () => {
  it("loads styles as pickers + has a base prompt input", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /style comparison/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("style-pick")).toHaveLength(2));
    expect(screen.getByPlaceholderText(/a sunset over the ocean/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /render/i })).toBeInTheDocument();
  });
});
