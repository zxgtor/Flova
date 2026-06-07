import { describe, it, expect, vi, beforeEach } from "vitest";
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
    listPresets: vi.fn(),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import Page from "@/app/manage/prompts/page";

describe("Prompt Library page", () => {
  beforeEach(() => {
    vi.mocked(api.listPresets).mockReset();
  });

  it("shows the empty state and a Save Prompt form", async () => {
    vi.mocked(api.listPresets).mockResolvedValue([]);
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /prompt library/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save prompt/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search saved prompts/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/no saved prompts yet/i)).toBeInTheDocument(),
    );
  });

  it("renders cards for returned presets", async () => {
    vi.mocked(api.listPresets).mockResolvedValue([
      {
        id: "p1",
        kind: "prompt",
        name: "Neon City",
        payload: {
          text: "A neon cyberpunk city at night",
          style: "Cyberpunk Noir",
          tags: ["sci-fi", "city"],
        },
        is_public: false,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "p2",
        kind: "prompt",
        name: "Forest Walk",
        payload: { text: "Misty forest documentary clip" },
        is_public: false,
        created_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
    ]);
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getAllByTestId("prompt-card")).toHaveLength(2));
    expect(screen.getByText(/neon cyberpunk city/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /use in workspace/i })).toHaveLength(2);
  });
});
