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

const monthly = Array.from({ length: 12 }, (_, i) => ({
  month: `2025-${String(i + 1).padStart(2, "0")}`,
  count: (i + 1) % 4,
}));

vi.mock("@/lib/api", () => ({
  api: {
    meUsage: vi.fn().mockResolvedValue({
      total_renders: 9,
      successful_renders: 7,
      failed_renders: 2,
      storage_bytes: 5 * 1024 * 1024,
      file_count: 8,
      renders_by_month: monthly,
    }),
    meRecentRenders: vi.fn().mockResolvedValue([
      {
        id: "r1",
        prompt: "a galaxy",
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

import Page from "@/app/account/usage/page";

describe("Usage Report page", () => {
  it("renders real stat cards, monthly bars, and activity rows", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /usage report/i })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("9")).toBeInTheDocument()); // total renders
    expect(screen.getByText("5.0 MB")).toBeInTheDocument(); // storage
    expect(screen.getByText("22%")).toBeInTheDocument(); // 2/9 failure rate

    await waitFor(() => expect(screen.getAllByTestId("monthly-bar")).toHaveLength(12));
    await waitFor(() => expect(screen.getAllByTestId("log-row")).toHaveLength(1));
    expect(screen.getByText(/a galaxy/i)).toBeInTheDocument();
  });
});
