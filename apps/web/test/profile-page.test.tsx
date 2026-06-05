import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/account/profile/page";

describe("User Profile page", () => {
  it("renders handle, 3 stats, 12 creations", () => {
    render(<Page />);
    expect(screen.getByText(/@AuraCreator/)).toBeInTheDocument();
    expect(screen.getByText(/total generations/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("creation-tile")).toHaveLength(12);
  });
});
