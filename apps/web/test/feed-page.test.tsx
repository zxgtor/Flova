import { describe, it, expect, vi, beforeEach } from "vitest";
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
    communityFeed: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import Page from "@/app/community/feed/page";

describe("Community Feed page", () => {
  beforeEach(() => {
    vi.mocked(api.communityFeed).mockReset();
  });

  it("renders the empty-state when no public renders exist", async () => {
    vi.mocked(api.communityFeed).mockResolvedValue([]);
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /community feed/i })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/no public renders yet/i)).toBeInTheDocument(),
    );
  });

  it("renders a tile per public render with author + prompt", async () => {
    vi.mocked(api.communityFeed).mockResolvedValue([
      {
        id: "r1",
        prompt: "a neon city",
        author: "Alice",
        created_at: "2025-01-01T00:00:00Z",
        output_file_id: "f1",
      },
      {
        id: "r2",
        prompt: "a desert dawn",
        author: "Bob",
        created_at: "2025-01-02T00:00:00Z",
        output_file_id: null,
      },
    ]);
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getAllByTestId("feed-tile")).toHaveLength(2));
    expect(screen.getByText(/neon city/i)).toBeInTheDocument();
    expect(screen.getByText(/@Alice/)).toBeInTheDocument();
    expect(screen.getByText(/@Bob/)).toBeInTheDocument();
  });
});
