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
        storage_key: "uploads/u1/f1/cat.jpg",
        tier: "hot",
        byte_size: 1024,
        content_type: "image/jpeg",
        created_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "f2",
        storage_key: "uploads/u1/f2/dog.jpg",
        tier: "hot",
        byte_size: 1024,
        content_type: "image/jpeg",
        created_at: "2025-01-02T00:00:00Z",
      },
    ]),
    listTrainingJobs: vi.fn().mockResolvedValue([
      {
        id: "j1",
        name: "Cinematic Noir v1",
        base_model: "cerspense/zeroscope_v2_576w",
        file_ids: ["f1", "f2"],
        params: { strength: 80, steps: 1500 },
        status: "queued",
        failure_reason: null,
        result_preset_id: null,
        created_at: "2025-01-03T00:00:00Z",
        updated_at: "2025-01-03T00:00:00Z",
      },
    ]),
    createTrainingJob: vi.fn(),
    deleteTrainingJob: vi.fn(),
  },
}));

import Page from "@/app/manage/styles/train/page";

describe("Style Training page", () => {
  it("renders the skeleton-mode banner, form with file pickers, and existing jobs", async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByRole("heading", { name: /train a style/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/skeleton mode/i);
    await waitFor(() => expect(screen.getAllByTestId("file-pick")).toHaveLength(2));
    expect(screen.getByRole("button", { name: /submit training job/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId("job-row")).toHaveLength(1));
    expect(screen.getByText(/cinematic noir v1/i)).toBeInTheDocument();
    expect(screen.getByText("queued")).toBeInTheDocument(); // the pill
  });
});
