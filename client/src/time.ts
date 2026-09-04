import type { Recurrence } from "./types";

export const WARSAW_TIME_ZONE = "Europe/Warsaw";

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((entry) => entry.type === type)?.value ?? "";
}

export function warsawDateValue(value: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: WARSAW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

export function warsawTimeParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WARSAW_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(value);
  const hour = Number(part(parts, "hour")) % 24;
  return {
    hour,
    minute: Number(part(parts, "minute")),
  };
}

export function warsawGreeting(value: Date) {
  const { hour } = warsawTimeParts(value);
  if (hour >= 5 && hour < 12) return "Good morning.";
  if (hour >= 12 && hour < 18) return "Good afternoon.";
  if (hour >= 18 && hour < 22) return "Good evening.";
  return "Good night.";
}

export function weekdayMondayFirst(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

export function blockOccursOn(
  block: { date: string; recurrence: Recurrence; recurrenceDays: number[] },
  day: string,
) {
  if (day < block.date) {
    return false;
  }
  if (block.recurrence === "none") {
    return day === block.date;
  }
  if (block.recurrence === "daily") {
    return true;
  }
  if (block.recurrence === "weekly") {
    return weekdayMondayFirst(day) === weekdayMondayFirst(block.date);
  }
  if (block.recurrence === "weekdays") {
    return block.recurrenceDays.includes(weekdayMondayFirst(day));
  }
  return false;
}

export function addCalendarDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function startOfWeek(isoDate: string) {
  return addCalendarDays(isoDate, -weekdayMondayFirst(isoDate));
}

export function weekDates(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) =>
    addCalendarDays(weekStart, index),
  );
}

function utcCalendarDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatWeekHeading(weekStart: string) {
  const start = utcCalendarDate(weekStart);
  const end = utcCalendarDate(addCalendarDays(weekStart, 6));
  const monthName = (value: Date) =>
    new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(
      value,
    );
  const startMonth = monthName(start);
  const endMonth = monthName(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
}

export function formatDayHeading(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcCalendarDate(isoDate));
}

export function formatWeekdayShort(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    timeZone: "UTC",
  }).format(utcCalendarDate(isoDate));
}

export function hourTicks(rangeStartMinutes: number, rangeEndMinutes: number) {
  const ticks: number[] = [];
  let tick = Math.floor(rangeStartMinutes / 60) * 60 + 60;
  while (tick < rangeEndMinutes) {
    ticks.push(tick);
    tick += 60;
  }
  return ticks;
}

export function calendarDayOffset(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  return Math.round(
    (Date.UTC(toYear, toMonth - 1, toDay) -
      Date.UTC(fromYear, fromMonth - 1, fromDay)) /
      86_400_000,
  );
}

export function parseTimeMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function isOvernight(start: string, end: string) {
  return parseTimeMinutes(end) < parseTimeMinutes(start);
}

export function blockSegmentsOnDay(
  block: {
    date: string;
    start: string;
    end: string;
    recurrence: Recurrence;
    recurrenceDays: number[];
  },
  day: string,
) {
  const start = parseTimeMinutes(block.start);
  const end = parseTimeMinutes(block.end);
  const overnight = end < start;
  const segments: { startMinutes: number; endMinutes: number }[] = [];
  if (blockOccursOn(block, day)) {
    segments.push({
      startMinutes: start,
      endMinutes: overnight ? 1440 : end,
    });
  }
  if (overnight && blockOccursOn(block, addCalendarDays(day, -1))) {
    segments.push({
      startMinutes: 0,
      endMinutes: end,
    });
  }
  return segments;
}

export function formatTimeLabel(value: string) {
  const minutes = parseTimeMinutes(value);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatHourLabel(hourIndex: number) {
  const hour = ((hourIndex % 24) + 24) % 24;
  return `${String(hour).padStart(2, "0")}:00`;
}

export function timeInputValue(value: string) {
  return formatTimeLabel(value);
}

export function toTimePayload(value: string) {
  return `${formatTimeLabel(value)}:00`;
}

export function axisMinutes(
  originDate: string,
  occurrenceDate: string,
  time: string,
) {
  return (
    calendarDayOffset(originDate, occurrenceDate) * 1440 +
    parseTimeMinutes(time)
  );
}

export function warsawMinutesOnDate(value: Date, originDate: string) {
  const { hour, minute } = warsawTimeParts(value);
  return (
    calendarDayOffset(originDate, warsawDateValue(value)) * 1440 +
    hour * 60 +
    minute
  );
}

export function aroundNowWindow(now = new Date()) {
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const originDate = warsawDateValue(windowStart);
  const startDate = originDate;
  const endDate = warsawDateValue(windowEnd);
  return {
    originDate,
    dates: startDate === endDate ? [startDate] : [startDate, endDate],
    rangeStartMinutes: warsawMinutesOnDate(windowStart, originDate),
    rangeEndMinutes: warsawMinutesOnDate(windowEnd, originDate),
    nowMinutes: warsawMinutesOnDate(now, originDate),
  };
}
