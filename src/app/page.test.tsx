import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import Home from "./page";
import { useSystemStore } from "@/lib/stores/system-store";

describe("Home Page with OSRoot", () => {
  beforeEach(() => {
    useSystemStore.setState({ phase: "lock" });
  });

  it("renders OS root and active screen", () => {
    render(<Home />);
    expect(screen.getByTestId("os-root")).toBeInTheDocument();
    expect(screen.getByTestId("lock-screen")).toBeInTheDocument();
  });
});
