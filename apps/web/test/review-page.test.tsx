import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { Suspense, type ReactNode } from "react";

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
    getRender: vi.fn().mockResolvedValue({
      id: "r1",
      prompt: "a luminescent desert",
      status: "done",
      failure_reason: null,
      output_file_id: "f1",
      external_job_id: null,
      is_public: false,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    }),
    setRenderPublic: vi.fn(),
  },
}));

import Page from "@/app/export/review/[id]/page";

describe("Review & Export page", () => {
  it("shows the real prompt, status, and a Publish button when status is done", async () => {
    await act(async () => {
      render(
        <Suspense>
          <Page params={Promise.resolve({ id: "r1" })} />
        </Suspense>,
      );
    });
    await waitFor(() =>
      expect(screen.getByText(/luminescent desert/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: /final review & export/i })).toBeInTheDocument();
    expect(screen.getByTestId("publish-button")).toHaveTextContent(/final export & publish/i);
  });
});
