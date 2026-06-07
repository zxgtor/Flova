import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/lib/auth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    token: null,
    user: null,
    loading: false,
    signIn: vi.fn(),
    register: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    communityFeedItem: vi.fn().mockResolvedValue({
      id: "rx",
      prompt: "a luminescent forest at dawn",
      author: "Casey",
      created_at: "2025-01-01T00:00:00Z",
      output_file_id: "f1",
    }),
  },
}));

import { Suspense } from "react";
import Page from "@/app/community/remix/[id]/page";

describe("Remix detail page", () => {
  it("renders real prompt + author + Use This Prompt link with prompt encoded", async () => {
    await act(async () => {
      render(
        <Suspense>
          <Page params={Promise.resolve({ id: "rx" })} />
        </Suspense>,
      );
    });
    await waitFor(() =>
      expect(screen.getByTestId("remix-prompt")).toHaveTextContent(/luminescent forest/i),
    );
    expect(screen.getByText(/@Casey/)).toBeInTheDocument();
    const use = screen.getByRole("link", { name: /use this prompt/i });
    expect(use).toHaveAttribute(
      "href",
      "/studio?prompt=a%20luminescent%20forest%20at%20dawn",
    );
  });
});
