import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
