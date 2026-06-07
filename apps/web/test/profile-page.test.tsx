import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    token: "tok",
    user: {
      id: "u1",
      email: "alice@example.com",
      display_name: "Alice",
      created_at: "2025-01-01",
    },
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    meStats: vi.fn().mockResolvedValue({
      total_renders: 7,
      successful_renders: 6,
      failed_renders: 1,
    }),
    meRecentRenders: vi.fn().mockResolvedValue([
      {
        id: "r1",
        prompt: "a cat in space",
        status: "done",
        failure_reason: null,
        output_file_id: "f1",
        external_job_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ]),
  },
}));

import Page from "@/app/account/profile/page";

describe("User Profile page", () => {
  it("shows the signed-in handle, email, and stats", async () => {
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getByText("@Alice")).toBeInTheDocument());
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("7")).toBeInTheDocument());
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders recent renders as rows", async () => {
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getAllByTestId("recent-row")).toHaveLength(1));
    expect(screen.getByText(/a cat in space/i)).toBeInTheDocument();
  });
});
