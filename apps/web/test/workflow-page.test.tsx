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
    meWorkflow: vi.fn().mockResolvedValue({
      stages: [
        { id: "concept", label: "Concept & Script", count: 1, status: "in_progress" },
        { id: "asset", label: "Asset Creation", count: 4, status: "complete" },
        { id: "storyboard", label: "Storyboard & Layout", count: 0, status: "todo" },
        { id: "editing", label: "Editing & VFX", count: 0, status: "todo" },
        { id: "export", label: "Final Export", count: 2, status: "in_progress" },
      ],
      activity: [
        {
          type: "render",
          label: "a galaxy",
          subtype: "done",
          created_at: "2025-01-01T00:00:00Z",
          link: "/render/r1",
        },
        {
          type: "preset",
          label: "Neon City",
          subtype: "prompt",
          created_at: "2024-12-31T00:00:00Z",
          link: null,
        },
      ],
    }),
  },
}));

import Page from "@/app/manage/workflow/page";

describe("Workflow Manager page", () => {
  it("renders title, 5 stage cards, and real activity rows", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /workflow manager/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("stage-card")).toHaveLength(5));
    expect(screen.getByText(/concept & script/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("activity-row")).toHaveLength(2));
    expect(screen.getByText(/a galaxy/i)).toBeInTheDocument();
    expect(screen.getByText(/neon city/i)).toBeInTheDocument();
  });
});
