import { ProjectItem } from "@/lib/schemas";

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  const daysPerMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return daysPerMonth[month];
}

/**
 * Returns the offset for Monday as the first day of the week (0 = Monday, 6 = Sunday).
 */
export function getFirstDayOfMonthOffset(year: number, month: number): number {
  const sundayBasedDay = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...
  return (sundayBasedDay + 6) % 7;
}

export interface CalendarDayCell {
  day: number;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
}

export function generateCalendarGrid(
  year: number,
  month: number
): CalendarDayCell[] {
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const startOffset = getFirstDayOfMonthOffset(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const cells: CalendarDayCell[] = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const mStr = String(prevMonth + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    cells.push({
      day,
      dateString: `${prevYear}-${mStr}-${dStr}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    cells.push({
      day: d,
      dateString: `${year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
    });
  }

  // Next month leading days (fill up to total grid multiple of 7, max 42 cells)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    const mStr = String(nextMonth + 1).padStart(2, "0");
    const dStr = String(n).padStart(2, "0");
    cells.push({
      day: n,
      dateString: `${nextYear}-${mStr}-${dStr}`,
      isCurrentMonth: false,
    });
  }

  return cells;
}

export function getProjectsForDate(
  projects: ProjectItem[],
  dateString: string
): ProjectItem[] {
  return projects.filter((p) => p.date === dateString);
}
