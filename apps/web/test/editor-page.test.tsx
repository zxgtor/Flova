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
    listMyFiles: vi.fn().mockResolvedValue([
      {
        id: "f1",
        storage_key: "uploads/u1/f1/clip.mp4",
        tier: "hot",
        byte_size: 1024 * 1024,
        content_type: "video/mp4",
        created_at: "2025-01-01T00:00:00Z",
      },
    ]),
    meRecentRenders: vi.fn().mockResolvedValue([
      {
        id: "r1",
        prompt: "a galaxy",
        status: "done",
        failure_reason: null,
        output_file_id: "fr1",
        external_job_id: null,
        is_public: false,
        created_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
    ]),
    listPresets: vi.fn().mockResolvedValue([]),
    createPreset: vi.fn(),
    deletePreset: vi.fn(),
  },
}));

import Page from "@/app/editor/page";

describe("Editor page", () => {
  it("renders asset library (real files + recent renders), tracks, properties", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /video editing workspace/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("editor-asset")).toHaveLength(2));
    expect(screen.getByText(/clip\.mp4/i)).toBeInTheDocument();
    expect(screen.getByText(/a galaxy/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("timeline-track")).toHaveLength(5);
    expect(screen.getByText(/ai enhancements/i)).toBeInTheDocument();
  });

  it("AI enhancement toggles flip on click", async () => {
    await act(async () => {
      render(<Page />);
    });
    const denoise = screen.getByTestId("toggle-denoise");
    expect(denoise).toHaveTextContent("ON");
    await act(async () => {
      denoise.click();
    });
    expect(denoise).toHaveTextContent("OFF");
  });
});
