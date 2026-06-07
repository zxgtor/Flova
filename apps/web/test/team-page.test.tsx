import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    token: "tok",
    user: { id: "u1", email: "a@b.co", display_name: "Alice", created_at: "" },
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    listTeams: vi.fn().mockResolvedValue([
      {
        id: "t1",
        owner_id: "u1",
        name: "Aurora Studio",
        created_at: "2025-01-01T00:00:00Z",
        my_role: "owner",
      },
      {
        id: "t2",
        owner_id: "u9",
        name: "Galaxy Labs",
        created_at: "2025-01-02T00:00:00Z",
        my_role: "editor",
      },
    ]),
    createTeam: vi.fn(),
  },
}));

import Page from "@/app/team/page";

describe("Teams list page", () => {
  it("renders Teams heading, New Team form, and real team rows", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /^teams$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("team-row")).toHaveLength(2));
    expect(screen.getByText("Aurora Studio")).toBeInTheDocument();
    expect(screen.getByText("Galaxy Labs")).toBeInTheDocument();
    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("editor")).toBeInTheDocument();
  });
});
