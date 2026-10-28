import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { CalendarApp } from "./CalendarApp";
import {
  isLeapYear,
  getDaysInMonth,
  getFirstDayOfMonthOffset,
  generateCalendarGrid,
} from "./calendar-utils";

describe("Calendar Grid Calculation Utilities", () => {
  it("determines leap years correctly", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
  });

  it("calculates correct days in February for leap and non-leap years", () => {
    // Month 1 is February (0-indexed)
    expect(getDaysInMonth(2024, 1)).toBe(29);
    expect(getDaysInMonth(2023, 1)).toBe(28);
    expect(getDaysInMonth(2024, 0)).toBe(31); // January
  });

  it("computes Monday-first offset correctly", () => {
    // 2024-01-01 was Monday -> offset 0
    expect(getFirstDayOfMonthOffset(2024, 0)).toBe(0);

    // 2024-09-01 was Sunday -> offset 6 (last day of week when Monday is 0)
    expect(getFirstDayOfMonthOffset(2024, 8)).toBe(6);
  });

  it("generates calendar grid with trailing and leading days filling multiples of 7", () => {
    const grid = generateCalendarGrid(2024, 8); // September 2024
    expect(grid.length % 7).toBe(0);

    // September has 30 days
    const currentMonthDays = grid.filter((c) => c.isCurrentMonth);
    expect(currentMonthDays.length).toBe(30);

    // Check specific project date format
    const sept18 = grid.find((c) => c.dateString === "2024-09-18");
    expect(sept18).toBeDefined();
    expect(sept18?.day).toBe(18);
  });
});

describe("CalendarApp RTL Component Tests", () => {
  beforeEach(() => {
    // Reset or prepare mock data if needed
  });

  it("renders calendar header, days of week, and date cells", () => {
    render(<CalendarApp />);

    expect(screen.getByTestId("calendar-month-title")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-prev-btn")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-next-btn")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-today-btn")).toBeInTheDocument();
  });

  it("displays project card when hovering over a date with project (e.g. 2024-09-18)", () => {
    render(<CalendarApp />);

    // PioPio project is on 2024-09-18
    const projectCell = screen.getByTestId("calendar-cell-2024-09-18");
    expect(projectCell).toBeInTheDocument();
    expect(screen.getByTestId("project-dot-2024-09-18")).toBeInTheDocument();

    // Hover over cell
    fireEvent.mouseEnter(projectCell);

    expect(screen.getByTestId("project-card")).toBeInTheDocument();
    expect(screen.getByText("PioPio Notch")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("does not display project card when hovering a date without projects", () => {
    render(<CalendarApp />);

    const emptyCell = screen.getByTestId("calendar-cell-2024-09-02");
    fireEvent.mouseEnter(emptyCell);

    expect(screen.queryByTestId("project-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("calendar-no-project")).toBeInTheDocument();
  });

  it("supports multiple projects on the same date", () => {
    // Project sramadhan-cv is on 2024-10-24
    render(<CalendarApp />);

    // Navigate to October if current month is September
    fireEvent.click(screen.getByTestId("calendar-next-btn"));

    const targetCell = screen.getByTestId("calendar-cell-2024-10-24");
    fireEvent.mouseEnter(targetCell);

    expect(screen.getByTestId("project-card")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Bergaya OS")).toBeInTheDocument();
  });
});
