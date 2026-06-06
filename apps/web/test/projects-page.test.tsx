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
    listProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import Page from "@/app/manage/projects/page";

describe("Projects page", () => {
  beforeEach(() => {
    vi.mocked(api.listProjects).mockReset();
    vi.mocked(api.createProject).mockReset();
  });

  it("shows the empty state when there are no projects", async () => {
    vi.mocked(api.listProjects).mockResolvedValue([]);
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() =>
      expect(screen.getByText(/no projects yet/i)).toBeInTheDocument(),
    );
  });

  it("renders rows for returned projects", async () => {
    vi.mocked(api.listProjects).mockResolvedValue([
      {
        id: "p1",
        title: "Odyssey",
        description: "Sci-fi short",
        status: "draft",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "p2",
        title: "Aurora",
        description: "",
        status: "in_progress",
        created_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
    ]);
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() =>
      expect(screen.getAllByTestId("project-row")).toHaveLength(2),
    );
    expect(screen.getByText("Odyssey")).toBeInTheDocument();
    expect(screen.getByText("in_progress")).toBeInTheDocument();
  });
});
