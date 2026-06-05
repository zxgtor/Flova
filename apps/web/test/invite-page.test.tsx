import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/team/invite/page";

describe("Invite Member page", () => {
  it("renders 3 role cards and send invitation", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /invite a collaborator/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("role-card")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /send invitation/i })).toBeInTheDocument();
  });
});
