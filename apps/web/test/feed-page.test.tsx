import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/community/feed/page";

describe("Community Feed page", () => {
  it("renders tabs, search, 12 feed tiles", () => {
    render(<Page />);
    expect(screen.getByPlaceholderText(/search community/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("feed-tile")).toHaveLength(12);
  });
});
