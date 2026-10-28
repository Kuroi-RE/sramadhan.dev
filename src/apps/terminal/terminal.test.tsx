import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { parseCommandLine, executeCommand } from "./command-registry";
import { TerminalApp } from "./TerminalApp";

describe("Terminal Command Registry and Parser", () => {
  it("parses command line with extra spaces and arguments", () => {
    const result = parseCommandLine("   echo   hello   world   ");
    expect(result.commandName).toBe("echo");
    expect(result.args).toEqual(["hello", "world"]);
  });

  it("handles empty command line", () => {
    const result = parseCommandLine("    ");
    expect(result.commandName).toBe("");
    expect(result.args).toEqual([]);
  });

  it("executes help command", async () => {
    const ctx = {
      clearOutput: vi.fn(),
      locale: "id" as const,
      t: (k: string) => k,
    };
    const output = await executeCommand("help", ctx);
    expect(output).not.toBeNull();
  });

  it("executes about command and shows profile name", async () => {
    const ctx = {
      clearOutput: vi.fn(),
      locale: "id" as const,
      t: (k: string) => k,
    };
    const output = await executeCommand("about", ctx);
    expect(output).not.toBeNull();
  });

  it("executes sosial command and its alias 'social'", async () => {
    const ctx = {
      clearOutput: vi.fn(),
      locale: "id" as const,
      t: (k: string) => k,
    };
    const output1 = await executeCommand("sosial", ctx);
    const output2 = await executeCommand("social", ctx);
    expect(output1).not.toBeNull();
    expect(output2).not.toBeNull();
  });

  it("executes clear command and invokes clearOutput callback", async () => {
    const clearMock = vi.fn();
    const ctx = {
      clearOutput: clearMock,
      locale: "id" as const,
      t: (k: string) => k,
    };
    const output = await executeCommand("clear", ctx);
    expect(clearMock).toHaveBeenCalled();
    expect(output).toBeNull();
  });

  it("returns error message for unknown command", async () => {
    const ctx = {
      clearOutput: vi.fn(),
      locale: "id" as const,
      t: (k: string) => k,
    };
    const output = await executeCommand("unknowncmd", ctx);
    expect(output).not.toBeNull();
  });
});

describe("TerminalApp Component RTL Tests", () => {
  it("renders prompt and handles command execution", async () => {
    render(<TerminalApp />);

    const input = screen.getByTestId("terminal-input") as HTMLInputElement;
    expect(screen.getByTestId("terminal-prompt")).toHaveTextContent(
      "guest@sramadhan.cv:~$"
    );

    // Execute about command
    await act(async () => {
      fireEvent.change(input, { target: { value: "about" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(screen.getByText("Satria Ramadhan")).toBeInTheDocument();
  });

  it("navigates history with ArrowUp", async () => {
    render(<TerminalApp />);
    const input = screen.getByTestId("terminal-input") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: "help" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // Press ArrowUp to retrieve "help"
    await act(async () => {
      fireEvent.keyDown(input, { key: "ArrowUp" });
    });

    expect(input.value).toBe("help");
  });

  it("completes command name with Tab", async () => {
    render(<TerminalApp />);
    const input = screen.getByTestId("terminal-input") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: "ab" } });
      fireEvent.keyDown(input, { key: "Tab" });
    });

    // Should autocomplete to "about "
    expect(input.value).toBe("about ");
  });

  it("clears terminal output when 'clear' is entered", async () => {
    render(<TerminalApp />);
    const input = screen.getByTestId("terminal-input") as HTMLInputElement;

    // Run about
    await act(async () => {
      fireEvent.change(input, { target: { value: "about" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(screen.getByText("Satria Ramadhan")).toBeInTheDocument();

    // Run clear
    await act(async () => {
      fireEvent.change(input, { target: { value: "clear" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(screen.queryByText("Satria Ramadhan")).not.toBeInTheDocument();
  });
});
