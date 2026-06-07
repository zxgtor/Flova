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
    marketplaceStyle: vi.fn().mockResolvedValue({
      id: "p1",
      name: "Ghibli Watercolor",
      payload: {
        prompt_template: "{prompt}, studio ghibli style",
        description: "Soft hand-painted look",
      },
      author: "Alice",
      created_at: "2025-01-01T00:00:00Z",
    }),
    importMarketplaceStyle: vi.fn(),
  },
}));

import Page from "@/app/community/marketplace/[id]/page";

describe("Style Detail page", () => {
  it("renders the public style + Import button + template preview", async () => {
    await act(async () => {
      render(
        <Suspense>
          <Page params={Promise.resolve({ id: "p1" })} />
        </Suspense>,
      );
    });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /ghibli watercolor/i })).toBeInTheDocument(),
    );
    expect(screen.getByText(/@Alice/)).toBeInTheDocument();
    expect(screen.getByTestId("template-block")).toHaveTextContent(/studio ghibli/i);
    expect(screen.getByTestId("import-button")).toHaveTextContent(/import to my library/i);
  });
});
