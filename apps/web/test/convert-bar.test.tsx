import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Signed-in mock so RenderCTA renders its real button instead of the sign-in link.
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

import { ConvertBar } from "@/components/studio/story/ConvertBar";

describe("ConvertBar", () => {
  it("renders progress + Convert + Export controls", () => {
    render(<ConvertBar />);
    expect(screen.getByRole("button", { name: /convert to video/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export to timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });
});
