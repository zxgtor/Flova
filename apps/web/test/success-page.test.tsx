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
      is_public: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    }),
    fileUrl: (id: string) => `http://api/${id}`,
  },
}));

import Page from "@/app/export/success/[id]/page";

describe("Publish Success page", () => {
  it("renders the share screen with download, copy, 4 share targets, and Start New Project", async () => {
    await act(async () => {
      render(
        <Suspense>
          <Page params={Promise.resolve({ id: "r1" })} />
        </Suspense>,
      );
    });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /production complete/i })).toBeInTheDocument(),
    );
    expect(screen.getByTestId("download-button")).toBeInTheDocument();
    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getAllByTestId("share-target")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /start new project/i })).toHaveAttribute("href", "/home");
  });
});
