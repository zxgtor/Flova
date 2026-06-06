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

import EnvironmentPage from "@/app/studio/environment/page";

describe("Environment Studio page", () => {
  it("composes nav, geography, canvas, atmosphere", () => {
    render(<EnvironmentPage />);
    expect(
      screen.getByRole("heading", { name: /environment designer studio/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Geography & Architecture")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate environment/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("reference-tile")).toHaveLength(3);
    expect(screen.getByText("Atmosphere")).toBeInTheDocument();
  });
});
