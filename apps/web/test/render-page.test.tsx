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
    meStats: vi.fn().mockResolvedValue({
      total_renders: 4,
      successful_renders: 3,
      failed_renders: 1,
    }),
    meRecentRenders: vi.fn().mockResolvedValue([
      {
        id: "r1",
        prompt: "a galaxy",
        status: "done",
        failure_reason: null,
        output_file_id: "f1",
        external_job_id: null,
        created_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
      {
        id: "r2",
        prompt: "a cat",
        status: "done",
        failure_reason: null,
        output_file_id: "f2",
        external_job_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ]),
  },
}));

import Page from "@/app/manage/render/page";

describe("Render Dashboard", () => {
  it("renders title, stats, filter pills, and real render rows", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /render dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new render/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("filter-pill")).toHaveLength(5);

    await waitFor(() => expect(screen.getByText("4")).toBeInTheDocument());
    await waitFor(() => expect(screen.getAllByTestId("render-row")).toHaveLength(2));
    expect(screen.getByText(/a galaxy/i)).toBeInTheDocument();
  });
});
