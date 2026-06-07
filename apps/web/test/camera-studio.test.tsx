import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Signed-in mock + minimal api mock so the page renders without trying to fetch.
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

vi.mock("@/lib/api", () => ({
  api: {
    listPresets: vi.fn().mockResolvedValue([]),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
    submitRender: vi.fn(),
    fileUrl: (id: string) => `/${id}`,
  },
}));

import CameraPage from "@/app/studio/camera/page";

describe("Camera & Lighting page", () => {
  it("renders nav, 8 preset tiles, save-custom button", () => {
    render(<CameraPage />);
    expect(screen.getByRole("heading", { name: /camera & light/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("preset-tile")).toHaveLength(8);
    expect(screen.getByRole("button", { name: /save new custom preset/i })).toBeInTheDocument();
  });
});
