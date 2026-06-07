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
    ]),
    addTeamMember: vi.fn(),
  },
}));

import Page from "@/app/team/invite/page";

describe("Invite page", () => {
  it("renders 3 role cards and Send Invitation button", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /invite a collaborator/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("role-card")).toHaveLength(3));
    expect(screen.getByRole("button", { name: /send invitation/i })).toBeInTheDocument();
  });
});
