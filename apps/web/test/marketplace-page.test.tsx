import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    token: null,
    user: null,
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    marketplaceStyles: vi.fn().mockResolvedValue([
      {
        id: "p1",
        name: "Ghibli Watercolor",
        payload: { prompt_template: "{prompt}, studio ghibli, vibrant colors" },
        author: "Alice",
        created_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "p2",
        name: "Cyberpunk Noir",
        payload: { prompt_template: "{prompt}, neon noir" },
        author: "Bob",
        created_at: "2025-01-02T00:00:00Z",
      },
    ]),
  },
}));

import Page from "@/app/community/marketplace/page";

describe("Style Marketplace page", () => {
  it("renders heading, search, and real public styles", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /style marketplace/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search styles/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("style-card")).toHaveLength(2));
    expect(screen.getByText("Ghibli Watercolor")).toBeInTheDocument();
    expect(screen.getByText(/@Alice/)).toBeInTheDocument();
    expect(screen.getByText(/@Bob/)).toBeInTheDocument();
  });
});
