import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

import VoicePage from "@/app/studio/voice/page";

describe("Voice Studio page", () => {
  it("composes nav, attributes, script, library", () => {
    render(<VoicePage />);
    expect(screen.getByRole("heading", { name: /voice design studio/i })).toBeInTheDocument();
    expect(screen.getByText(/voice attributes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate preview/i })).toBeInTheDocument();
    expect(screen.getByText(/voice library/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("voice-preset")).toHaveLength(4);
    expect(screen.getByText(/clone a voice/i)).toBeInTheDocument();
  });
});
