"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { projects } from "../../../content/projects";
import { ProjectItem } from "@/lib/schemas";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useLocalized, useT } from "@/lib/i18n";
import {
  generateCalendarGrid,
  getProjectsForDate,
  CalendarDayCell,
} from "./calendar-utils";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { GitHubIcon } from "@/components/icons/GitHubIcon";

function getInitialCalendarDate(): Date {
  if (projects.length > 0 && projects[0].date) {
    const [y, m] = projects[0].date.split("-").map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      return new Date(y, m - 1, 1);
    }
  }
  return new Date();
}

export function CalendarApp() {
  const locale = useSettingsStore((state) => state.locale);
  const accentColor = useSettingsStore((state) => state.accentColor);
  const t = useT();
  const localized = useLocalized();

  const [currentYear, setCurrentYear] = useState<number>(() =>
    getInitialCalendarDate().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(() =>
    getInitialCalendarDate().getMonth()
  );
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const gridCells = useMemo(() => {
    return generateCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(currentYear, currentMonth, 1));
  }, [currentYear, currentMonth, locale]);

  const dayNames = useMemo(() => {
    // Generate Monday-first day headers
    const format = new Intl.DateTimeFormat(
      locale === "id" ? "id-ID" : "en-US",
      {
        weekday: "short",
      }
    );
    // 2024-01-01 was a Monday
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const d = new Date(2024, 0, 1 + offset);
      return format.format(d);
    });
  }, [locale]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const activeDate = selectedDate || hoveredDate;
  const activeProjects: ProjectItem[] = useMemo(() => {
    if (!activeDate) return [];
    return getProjectsForDate(projects, activeDate);
  }, [activeDate]);

  return (
    <div
      data-testid="calendar-app"
      className="flex h-full w-full select-none flex-col bg-[var(--linux-surface)] text-[var(--linux-text)] p-5 overflow-y-auto"
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--linux-border)]">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-4 w-4 text-[var(--linux-accent)]" />
          <h2
            data-testid="calendar-month-title"
            className="text-sm font-mono font-semibold capitalize tracking-wide"
          >
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="calendar-today-btn"
            onClick={handleGoToday}
            className="linux-focus-ring px-2.5 py-1 rounded-[4px] text-xs font-mono bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-border)] text-[var(--linux-text)] transition-colors"
          >
            {locale === "id" ? "Hari Ini" : "Today"}
          </button>
          <button
            type="button"
            data-testid="calendar-prev-btn"
            onClick={handlePrevMonth}
            className="linux-focus-ring flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="calendar-next-btn"
            onClick={handleNextMonth}
            className="linux-focus-ring flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 pt-4 flex-1">
        {/* Calendar Grid View */}
        <div className="flex flex-col">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 text-center pb-2 text-[11px] font-mono font-semibold text-[var(--linux-text-muted)] uppercase tracking-wider">
            {dayNames.map((name) => (
              <div key={name} className="py-1">
                {name}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {gridCells.map((cell: CalendarDayCell) => {
              const dayProjects = getProjectsForDate(projects, cell.dateString);
              const hasProject = dayProjects.length > 0;
              const isSelected = activeDate === cell.dateString;

              return (
                <div
                  key={cell.dateString}
                  data-testid={`calendar-cell-${cell.dateString}`}
                  onMouseEnter={() => {
                    if (hasProject) setHoveredDate(cell.dateString);
                  }}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => {
                    if (hasProject) {
                      setSelectedDate((prev) =>
                        prev === cell.dateString ? null : cell.dateString
                      );
                    }
                  }}
                  tabIndex={hasProject ? 0 : -1}
                  onFocus={() => {
                    if (hasProject) setHoveredDate(cell.dateString);
                  }}
                  onBlur={() => setHoveredDate(null)}
                  className={`linux-focus-ring relative flex flex-col items-center justify-start rounded-[5px] p-2 min-h-[56px] border transition-colors cursor-default ${
                    !cell.isCurrentMonth
                      ? "opacity-35 border-transparent bg-[var(--linux-bg)]/40 text-[var(--linux-text-subtle)]"
                      : isSelected
                        ? "border-[var(--linux-accent)] bg-[var(--linux-surface-raised)] text-[var(--linux-text)]"
                        : hasProject
                          ? "border-[var(--linux-border-strong)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] hover:border-[var(--linux-accent)]/60 cursor-pointer"
                          : "border-[var(--linux-border)] bg-[var(--linux-bg)]/70 text-[var(--linux-text-muted)]"
                  }`}
                >
                  <span className="text-xs font-mono font-medium">
                    {cell.day}
                  </span>

                  {hasProject && (
                    <div className="mt-1.5 flex gap-1">
                      {dayProjects.map((p) => (
                        <span
                          key={p.id}
                          data-testid={`project-dot-${cell.dateString}`}
                          className="h-1.5 w-1.5 rounded-[2px]"
                          style={{
                            backgroundColor:
                              accentColor || "var(--linux-accent)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Details Popup / Linux Side Panel */}
        <div className="flex flex-col">
          <div className="linux-mono-label mb-2">
            {locale === "id"
              ? "Detail Event & Proyek"
              : "Event & Project Details"}
          </div>

          {activeProjects.length > 0 ? (
            <div data-testid="project-card" className="space-y-3">
              <div className="text-xs text-[var(--linux-text-muted)] font-mono">
                Tanggal:{" "}
                <span className="text-[var(--linux-accent)] font-medium">
                  {activeDate}
                </span>
              </div>

              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  data-testid={`project-item-${project.id}`}
                  className="rounded-md border border-[var(--linux-border-strong)] bg-[var(--linux-bg)] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[var(--linux-text)] leading-snug">
                      {localized(project.name)}
                    </h3>
                  </div>

                  <p className="text-xs text-[var(--linux-text-muted)] leading-relaxed">
                    {localized(project.description)}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--linux-border)] bg-[var(--linux-surface-raised)] px-2.5 py-1 text-xs font-mono text-[var(--linux-text-muted)] hover:bg-[var(--linux-surface-hover)] hover:text-[var(--linux-text)] transition-colors"
                      >
                        <GitHubIcon className="h-3.5 w-3.5" />
                        <span>{t("calendar.github")}</span>
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--linux-accent)]/50 bg-[var(--linux-surface-raised)] px-2.5 py-1 text-xs font-mono text-[var(--linux-accent)] hover:bg-[var(--linux-surface-hover)] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{t("calendar.demo")}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              data-testid="calendar-no-project"
              className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-[var(--linux-border)] bg-[var(--linux-bg)] p-6 text-center text-xs text-[var(--linux-text-subtle)]"
            >
              <CalendarIcon className="h-7 w-7 text-[var(--linux-text-subtle)] mb-2" />
              <span>
                {locale === "id"
                  ? "Arahkan kursor atau klik tanggal bertitik untuk melihat proyek."
                  : "Hover or tap on a marked date to view projects."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Project Details */}
      <AnimatePresence>
        {selectedDate && activeProjects.length > 0 && (
          <div
            data-testid="calendar-bottom-sheet-backdrop"
            className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-[4px]"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              data-testid="calendar-bottom-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[75vh] overflow-y-auto rounded-t-md border-t border-[var(--linux-border-strong)] bg-[var(--linux-surface)] p-5"
            >
              {/* Drag handle */}
              <div className="mx-auto mb-3 h-1 w-10 rounded-none bg-[var(--linux-border-strong)]" />

              <div className="flex items-center justify-between pb-3 border-b border-[var(--linux-border)] mb-4">
                <span className="text-xs font-mono font-semibold text-[var(--linux-text)]">
                  {locale === "id" ? "Detail Proyek" : "Project Details"} [
                  {selectedDate}]
                </span>
                <button
                  type="button"
                  data-testid="calendar-bottom-sheet-close"
                  onClick={() => setSelectedDate(null)}
                  className="rounded-[4px] p-1 text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] bg-[var(--linux-surface-raised)] border border-[var(--linux-border)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-md border border-[var(--linux-border)] bg-[var(--linux-bg)] p-4 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-[var(--linux-text)] leading-snug">
                      {localized(project.name)}
                    </h3>
                    <p className="text-xs text-[var(--linux-text-muted)] leading-relaxed">
                      {localized(project.description)}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--linux-border)] bg-[var(--linux-surface-raised)] px-2.5 py-1 text-xs font-mono text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors"
                        >
                          <GitHubIcon className="h-3.5 w-3.5" />
                          <span>{t("calendar.github")}</span>
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--linux-accent)]/50 bg-[var(--linux-surface-raised)] px-2.5 py-1 text-xs font-mono text-[var(--linux-accent)] transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>{t("calendar.demo")}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
