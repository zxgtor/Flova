import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
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
    listMyFiles: vi.fn(),
    uploadFile: vi.fn(),
    fileUrl: (id: string) => `http://api/${id}`,
  },
}));

import { api } from "@/lib/api";
import Page from "@/app/manage/assets/page";

describe("Assets page", () => {
  beforeEach(() => {
    vi.mocked(api.listMyFiles).mockReset();
  });

  it("renders the upload drop and an empty state", async () => {
    vi.mocked(api.listMyFiles).mockResolvedValue([]);
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByTestId("upload-drop")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/no assets uploaded/i)).toBeInTheDocument(),
    );
  });

  it("renders rows for returned files", async () => {
    vi.mocked(api.listMyFiles).mockResolvedValue([
      {
        id: "f1",
        storage_key: "uploads/u1/f1/hello.txt",
        tier: "hot",
        byte_size: 12,
        content_type: "text/plain",
        created_at: "2025-01-01T00:00:00Z",
      },
    ]);
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getAllByTestId("asset-row")).toHaveLength(1));
    expect(screen.getByText("hello.txt")).toBeInTheDocument();
  });
});
