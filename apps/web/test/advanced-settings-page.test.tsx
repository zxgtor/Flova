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
    listPresets: vi.fn().mockResolvedValue([]),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
  },
}));

import Page from "@/app/manage/styles/settings/page";

describe("Render Defaults page", () => {
  it("renders the banner, lighting picks, enhancement toggles, preview, and Save", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /render defaults/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/render defaults/i);
    expect(screen.getByTestId("lighting-natural")).toBeInTheDocument();
    expect(screen.getByTestId("lighting-cinematic")).toBeInTheDocument();
    expect(screen.getByTestId("toggle-denoise")).toBeInTheDocument();
    expect(screen.getByTestId("save-button")).toBeInTheDocument();
    // Preview block shows the sample applied with the default natural lighting.
    await waitFor(() => expect(screen.getByText(/a sunset over the ocean/i)).toBeInTheDocument());
  });
});
