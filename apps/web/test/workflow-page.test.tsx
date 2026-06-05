import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/manage/workflow/page";

describe("Workflow Manager page", () => {
  it("renders 5 pipeline steps and recent activity", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /workflow manager/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("workflow-step")).toHaveLength(5);
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
  });
});
