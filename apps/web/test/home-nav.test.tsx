import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Override the global auth mock to simulate a signed-in user for this file.
vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    token: "tok",
    user: { id: "u1", email: "a@b.co", display_name: "A", created_at: "2025-01-01" },
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import { HomeNav } from "@/components/home/HomeNav";

describe("HomeNav (signed in)", () => {
  it("renders the four site-map sections plus Generate and Profile (Avatar)", () => {
    render(<HomeNav />);
    expect(screen.getByRole("link", { name: "AI Studio" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: "Generate" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/account/profile",
    );
  });

  it("does not render the Sign in CTA", () => {
    render(<HomeNav />);
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("renders a Sign out button", () => {
    render(<HomeNav />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
