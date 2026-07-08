"use client";

import { useEffect, useRef, useState } from "react";

const GITHUB_USERNAME = "namerror";

type GitHubCalendarOptions = {
  responsive?: boolean;
  tooltips?: boolean;
  global_stats?: boolean;
  summary_text?: string;
};

type GitHubCalendarModule = {
  default?: (
    container: HTMLElement,
    username: string,
    options?: GitHubCalendarOptions
  ) => Promise<unknown>;
};

type ContributionDay = {
  date: Date;
  count: number;
};

type DateRange = {
  start: Date;
  end: Date;
};

type ContributionStats = {
  total: number;
  longestStreak: number;
  longestStreakRange: DateRange | null;
  currentStreak: number;
  currentStreakRange: DateRange | null;
  visibleRange: DateRange | null;
};

const monthDayFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const fullDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function parseContributionCount(label: string) {
  if (label.includes("No contributions")) {
    return 0;
  }

  const match = label.match(/([0-9,]+) contributions?/);
  return match ? Number(match[1].replaceAll(",", "")) : 0;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function isNextDay(previous: Date, next: Date) {
  return addDays(previous, 1).getTime() === next.getTime();
}

function formatDayCount(days: number) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatRange(range: DateRange | null) {
  if (!range) {
    return "No contributions yet";
  }

  if (range.start.getTime() === range.end.getTime()) {
    return monthDayFormatter.format(range.start);
  }

  return `${monthDayFormatter.format(range.start)} - ${monthDayFormatter.format(
    range.end
  )}`;
}

function buildTooltipMap(container: HTMLElement) {
  const tooltipMap = new Map<string, string>();

  container.querySelectorAll("tool-tip[for]").forEach((tooltip) => {
    const targetId = tooltip.getAttribute("for");
    if (targetId) {
      tooltipMap.set(targetId, tooltip.textContent?.trim() ?? "");
    }
  });

  return tooltipMap;
}

function readContributionDays(container: HTMLElement) {
  const tooltipMap = buildTooltipMap(container);

  return Array.from(
    container.querySelectorAll<HTMLElement>(".ContributionCalendar-day[data-date]")
  )
    .map((dayCell): ContributionDay | null => {
      const dateValue = dayCell.dataset.date;
      if (!dateValue) {
        return null;
      }

      const label = tooltipMap.get(dayCell.id) ?? dayCell.textContent ?? "";

      return {
        date: new Date(`${dateValue}T00:00:00Z`),
        count: parseContributionCount(label),
      };
    })
    .filter((day): day is ContributionDay => Boolean(day))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function calculateContributionStats(container: HTMLElement): ContributionStats {
  const days = readContributionDays(container);
  const visibleRange = days.length
    ? { start: days[0].date, end: days[days.length - 1].date }
    : null;

  let total = 0;
  let activeStreak = 0;
  let activeRange: DateRange | null = null;
  let longestStreak = 0;
  let longestStreakRange: DateRange | null = null;

  days.forEach((day) => {
    total += day.count;

    if (day.count > 0) {
      if (activeRange && isNextDay(activeRange.end, day.date)) {
        activeRange.end = day.date;
        activeStreak += 1;
      } else {
        activeRange = { start: day.date, end: day.date };
        activeStreak = 1;
      }

      if (activeStreak > longestStreak) {
        longestStreak = activeStreak;
        longestStreakRange = {
          start: activeRange.start,
          end: activeRange.end,
        };
      }
    } else {
      activeRange = null;
      activeStreak = 0;
    }
  });

  return {
    total,
    longestStreak,
    longestStreakRange,
    currentStreak: activeStreak,
    currentStreakRange: activeRange,
    visibleRange,
  };
}

function ContributionStatsGrid({ stats }: { stats: ContributionStats }) {
  return (
    <div className="github-calendar-stats">
      <div className="github-calendar-stat github-calendar-stat-first">
        <span className="github-calendar-stat-label">
          Contributions in the last year
        </span>
        <span className="github-calendar-stat-number">
          {stats.total.toLocaleString()} total
        </span>
        <span className="github-calendar-stat-label">
          {stats.visibleRange
            ? `${fullDateFormatter.format(
                stats.visibleRange.start
              )} - ${fullDateFormatter.format(stats.visibleRange.end)}`
            : "No date range available"}
        </span>
      </div>
      <div className="github-calendar-stat">
        <span className="github-calendar-stat-label">Longest streak</span>
        <span className="github-calendar-stat-number">
          {formatDayCount(stats.longestStreak)}
        </span>
        <span className="github-calendar-stat-label">
          {formatRange(stats.longestStreakRange)}
        </span>
      </div>
      <div className="github-calendar-stat">
        <span className="github-calendar-stat-label">Current streak</span>
        <span className="github-calendar-stat-number">
          {formatDayCount(stats.currentStreak)}
        </span>
        <span className="github-calendar-stat-label">
          {formatRange(stats.currentStreakRange)}
        </span>
      </div>
    </div>
  );
}

export default function GitHubContributionCalendar() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [stats, setStats] = useState<ContributionStats | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCalendar() {
      if (!calendarRef.current) {
        return;
      }

      try {
        setHasError(false);
        setStats(null);

        const calendarModule =
          (await import("github-calendar")) as GitHubCalendarModule;
        const GitHubCalendar = calendarModule.default;

        if (!GitHubCalendar) {
          throw new Error("GitHub calendar module did not load.");
        }

        calendarRef.current.innerHTML =
          '<p class="github-calendar-loading">Loading contribution activity...</p>';

        await GitHubCalendar(calendarRef.current, GITHUB_USERNAME, {
          responsive: false,
          tooltips: false,
          global_stats: false,
        });

        const nextStats = calculateContributionStats(calendarRef.current);
        if (isMounted) {
          setStats(nextStats);
        }
      } catch (error) {
        console.error("Failed to load GitHub contribution calendar", error);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    loadCalendar();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="github-contributions"
      className="mb-16 bg-[#fafafa] p-6 rounded-xl shadow-md"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">GitHub Contributions</h2>
          <p className="mt-2 text-sm text-gray-600">
            Recent contribution activity from GitHub.
          </p>
        </div>
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-700 underline-offset-4 hover:text-black hover:underline"
        >
          @{GITHUB_USERNAME}
        </a>
      </div>

      {hasError ? (
        <p className="rounded-lg bg-[#f2f3f3] p-4 text-sm text-gray-700">
          GitHub contribution activity is unavailable right now. View the
          profile on{" "}
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      ) : (
        <>
          <div ref={calendarRef} className="github-calendar calendar">
            <p className="github-calendar-loading">
              Loading contribution activity...
            </p>
          </div>
          {stats && <ContributionStatsGrid stats={stats} />}
        </>
      )}
    </section>
  );
}
