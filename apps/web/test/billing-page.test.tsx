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
    getSubscription: vi.fn(),
    stubActivate: vi.fn(),
    checkout: vi.fn(),
    portal: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import Page from "@/app/account/billing/page";

describe("Billing page", () => {
  beforeEach(() => {
    vi.mocked(api.getSubscription).mockReset();
    vi.mocked(api.stubActivate).mockReset();
  });

  it("renders the Free plan + Upgrade button in stub mode", async () => {
    vi.mocked(api.getSubscription).mockResolvedValue({
      plan: "free",
      status: "none",
      current_period_end: null,
      provider: "stub",
    });
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getByText("Free")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /upgrade to pro/i })).toBeInTheDocument();
    expect(screen.getByTestId("subscription-status")).toHaveTextContent("none");
  });

  it("renders the Pro plan when active", async () => {
    vi.mocked(api.getSubscription).mockResolvedValue({
      plan: "pro",
      status: "active",
      current_period_end: "2026-12-01T00:00:00Z",
      provider: "stripe",
    });
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => expect(screen.getByText("Pro")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /manage subscription/i })).toBeInTheDocument();
    expect(screen.getByTestId("subscription-status")).toHaveTextContent("active");
  });
});
