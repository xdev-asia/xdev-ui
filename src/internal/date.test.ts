import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addYears,
  clampIso,
  compareIso,
  dayLabel,
  dayOfWeek,
  daysInMonth,
  endOfWeek,
  formatDate,
  fromDayNumber,
  gridKey,
  isBetween,
  isDayDisabled,
  isIso,
  isoFromDate,
  keepInView,
  monthGrid,
  monthTitle,
  orderRange,
  parseDateText,
  parseIso,
  pickRange,
  sameMonth,
  startOfMonth,
  startOfWeek,
  toDayNumber,
  weekdayNames,
} from "./date";

describe("ISO parsing and day numbers", () => {
  it("parses strict YYYY-MM-DD and rejects impossible days", () => {
    expect(parseIso("2026-11-06")).toEqual({ y: 2026, m: 11, d: 6 });
    expect(parseIso("2025-02-29")).toBeNull();
    expect(parseIso("2024-02-29")).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseIso("2026-13-01")).toBeNull();
    expect(parseIso("2026-1-01")).toBeNull();
    expect(parseIso("2026-11-06T00:00")).toBeNull();
    expect(parseIso(null)).toBeNull();
    expect(isIso("1900-02-29")).toBe(false);
    expect(isIso("2000-02-29")).toBe(true);
  });
  it("counts days in months, leap years included", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2100, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
  it("round-trips day numbers", () => {
    expect(toDayNumber(1970, 1, 1)).toBe(0);
    expect(toDayNumber(2000, 3, 1)).toBe(11017);
    for (const n of [-1000, -1, 0, 59, 60, 11016, 20000, 2932896]) {
      const { y, m, d } = fromDayNumber(n);
      expect(toDayNumber(y, m, d)).toBe(n);
    }
  });
  it("reads the local calendar day of a Date", () => {
    expect(isoFromDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(isoFromDate(new Date(2026, 10, 6, 0, 0))).toBe("2026-11-06");
  });
});

describe("arithmetic", () => {
  it("adds days across months and years", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30"); // DST weekend in Europe
    expect(addDays("2026-11-06", -365)).toBe("2025-11-06");
  });
  it("adds months, keeping the day or using the month's last day", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-15");
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28");
    expect(addMonths("2026-05-10", -25)).toBe("2024-04-10");
    expect(addYears("2024-02-29", 1)).toBe("2025-02-28");
    expect(addYears("2026-07-04", -3)).toBe("2023-07-04");
  });
  it("throws on a non-ISO input", () => {
    expect(() => addDays("06/11/2026", 1)).toThrow(RangeError);
  });
  it("compares and clamps", () => {
    expect(compareIso("2026-01-01", "2026-01-02")).toBe(-1);
    expect(compareIso("2026-01-02", "2026-01-02")).toBe(0);
    expect(compareIso("2027-01-01", "2026-12-31")).toBe(1);
    expect(clampIso("2026-01-01", "2026-02-01", "2026-03-01")).toBe("2026-02-01");
    expect(clampIso("2026-04-01", "2026-02-01", "2026-03-01")).toBe("2026-03-01");
    expect(clampIso("2026-02-15", "2026-02-01", "2026-03-01")).toBe("2026-02-15");
    expect(clampIso("2026-02-15")).toBe("2026-02-15");
    expect(clampIso("2026-02-15", null, "2026-02-10")).toBe("2026-02-10");
  });
  it("knows weekdays and week bounds", () => {
    expect(dayOfWeek("1970-01-01")).toBe(4);
    expect(dayOfWeek("2026-11-06")).toBe(5); // Friday
    expect(dayOfWeek("1969-12-28")).toBe(0);
    expect(startOfWeek("2026-11-06")).toBe("2026-11-02");
    expect(endOfWeek("2026-11-06")).toBe("2026-11-08");
    expect(startOfWeek("2026-11-06", 0)).toBe("2026-11-01");
    expect(endOfWeek("2026-11-06", 0)).toBe("2026-11-07");
    expect(startOfWeek("2026-11-02", 1)).toBe("2026-11-02");
    expect(startOfWeek("2026-11-06", 6)).toBe("2026-10-31");
    expect(startOfMonth("2026-11-06")).toBe("2026-11-01");
    expect(sameMonth("2026-11-06", "2026-11-30")).toBe(true);
    expect(sameMonth("2026-11-06", "2025-11-06")).toBe(false);
  });
});

describe("monthGrid", () => {
  it("is six weeks of seven days starting on Monday by default", () => {
    const g = monthGrid(2026, 11);
    expect(g).toHaveLength(6);
    for (const w of g) expect(w).toHaveLength(7);
    expect(g[0][0]).toBe("2026-10-26");
    expect(g[0][6]).toBe("2026-11-01");
    expect(g[5][6]).toBe("2026-12-06");
    expect(g.flat().every((d) => dayOfWeek(d) !== undefined)).toBe(true);
    expect(g.map((w) => dayOfWeek(w[0]))).toEqual([1, 1, 1, 1, 1, 1]);
  });
  it("honours weekStartsOn", () => {
    const g = monthGrid(2026, 11, 0);
    expect(g[0][0]).toBe("2026-11-01");
    expect(dayOfWeek(g[0][0])).toBe(0);
  });
  it("starts on the 1st when the month begins on the week start", () => {
    expect(monthGrid(2026, 6)[0][0]).toBe("2026-06-01"); // a Monday
    expect(monthGrid(2026, 2)[0][0]).toBe("2026-01-26");
  });
  it("contains every day of the month exactly once, in order", () => {
    const days = monthGrid(2024, 2).flat().filter((d) => d.startsWith("2024-02"));
    expect(days).toHaveLength(29);
    expect(days[0]).toBe("2024-02-01");
    expect(days[28]).toBe("2024-02-29");
  });
});

describe("isDayDisabled", () => {
  it("uses min, max and the predicate", () => {
    const weekend = (iso: string) => dayOfWeek(iso) === 0 || dayOfWeek(iso) === 6;
    expect(isDayDisabled("2026-11-06", "2026-11-07")).toBe(true);
    expect(isDayDisabled("2026-11-06", null, "2026-11-05")).toBe(true);
    expect(isDayDisabled("2026-11-06", "2026-11-06", "2026-11-06")).toBe(false);
    expect(isDayDisabled("2026-11-07", null, null, weekend)).toBe(true);
    expect(isDayDisabled("2026-11-06", null, null, weekend)).toBe(false);
  });
});

describe("gridKey", () => {
  const d = "2026-11-06"; // Friday
  it("moves by day and week with the arrows", () => {
    expect(gridKey("ArrowLeft", d)).toBe("2026-11-05");
    expect(gridKey("ArrowRight", d)).toBe("2026-11-07");
    expect(gridKey("ArrowUp", d)).toBe("2026-10-30");
    expect(gridKey("ArrowDown", d)).toBe("2026-11-13");
    expect(gridKey("ArrowRight", "2026-12-31")).toBe("2027-01-01");
  });
  it("goes to the week's start and end with Home and End", () => {
    expect(gridKey("Home", d)).toBe("2026-11-02");
    expect(gridKey("End", d)).toBe("2026-11-08");
    expect(gridKey("Home", d, { weekStartsOn: 0 })).toBe("2026-11-01");
    expect(gridKey("End", d, { weekStartsOn: 0 })).toBe("2026-11-07");
  });
  it("moves a month with PageUp and PageDown, a year with Shift", () => {
    expect(gridKey("PageUp", d)).toBe("2026-10-06");
    expect(gridKey("PageDown", d)).toBe("2026-12-06");
    expect(gridKey("PageDown", "2026-01-31")).toBe("2026-02-28");
    expect(gridKey("PageUp", d, { shiftKey: true })).toBe("2025-11-06");
    expect(gridKey("PageDown", "2024-02-29", { shiftKey: true })).toBe("2025-02-28");
  });
  it("ignores other keys", () => {
    expect(gridKey("Enter", d)).toBeNull();
    expect(gridKey("a", d)).toBeNull();
  });
});

describe("text format and parse", () => {
  it("formats with dd/mm/yyyy by default and other patterns", () => {
    expect(formatDate("2026-11-06")).toBe("06/11/2026");
    expect(formatDate("2026-11-06", "yyyy-mm-dd")).toBe("2026-11-06");
    expect(formatDate("2026-11-06", "mm.dd.yyyy")).toBe("11.06.2026");
    expect(formatDate("2026-11-06", "DD/MM/YYYY")).toBe("06/11/2026");
    expect(formatDate(null)).toBe("");
    expect(formatDate("2026-02-30")).toBe("");
    expect(formatDate("2026-11-06", "dd/mm")).toBe("");
  });
  it("parses dd/mm/yyyy with short fields and any of / - .", () => {
    expect(parseDateText("06/11/2026")).toBe("2026-11-06");
    expect(parseDateText("6/11/2026")).toBe("2026-11-06");
    expect(parseDateText("6/1/2026")).toBe("2026-01-06");
    expect(parseDateText("06-11-2026")).toBe("2026-11-06");
    expect(parseDateText("06.11.2026")).toBe("2026-11-06");
    expect(parseDateText(" 6 / 11 / 2026 ")).toBe("2026-11-06");
    expect(parseDateText("29/02/2024")).toBe("2024-02-29");
  });
  it("rejects impossible or malformed dates", () => {
    expect(parseDateText("31/02/2026")).toBeNull();
    expect(parseDateText("29/02/2025")).toBeNull();
    expect(parseDateText("00/01/2026")).toBeNull();
    expect(parseDateText("12/13/2026")).toBeNull();
    expect(parseDateText("1/1/26")).toBeNull();
    expect(parseDateText("06112026")).toBeNull();
    expect(parseDateText("aa/bb/cccc")).toBeNull();
    expect(parseDateText("")).toBeNull();
    expect(parseDateText("1/2/3/2026")).toBeNull();
    expect(parseDateText("123/1/2026")).toBeNull();
  });
  it("follows the field order of the format", () => {
    expect(parseDateText("11/06/2026", "mm/dd/yyyy")).toBe("2026-11-06");
    expect(parseDateText("2026-11-6", "yyyy-mm-dd")).toBe("2026-11-06");
    expect(parseDateText("2026/2/30", "yyyy-mm-dd")).toBeNull();
  });
});

describe("ranges", () => {
  it("orders two days", () => {
    expect(orderRange("2026-11-10", "2026-11-02")).toEqual({ start: "2026-11-02", end: "2026-11-10" });
    expect(orderRange("2026-11-02", "2026-11-10")).toEqual({ start: "2026-11-02", end: "2026-11-10" });
  });
  it("picks the start, then the end, swapping when the end is earlier", () => {
    const first = pickRange(null, "2026-11-10");
    expect(first).toEqual({ range: { start: "2026-11-10", end: null }, pending: "2026-11-10", done: false });
    expect(pickRange(first.pending, "2026-11-02")).toEqual({ range: { start: "2026-11-02", end: "2026-11-10" }, pending: null, done: true });
    expect(pickRange("2026-11-02", "2026-11-02")).toEqual({ range: { start: "2026-11-02", end: "2026-11-02" }, pending: null, done: true });
  });
  it("tells days strictly inside a range", () => {
    expect(isBetween("2026-11-05", "2026-11-02", "2026-11-10")).toBe(true);
    expect(isBetween("2026-11-05", "2026-11-10", "2026-11-02")).toBe(true);
    expect(isBetween("2026-11-02", "2026-11-02", "2026-11-10")).toBe(false);
    expect(isBetween("2026-11-05", "2026-11-02", null)).toBe(false);
  });
});

describe("names", () => {
  it("titles a month in the locale", () => {
    expect(monthTitle(2026, 11)).toBe("November 2026");
    expect(monthTitle(2026, 11, "vi").toLowerCase()).toContain("11");
  });
  it("lists weekdays from the week start", () => {
    expect(weekdayNames().map((w) => w.short)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(weekdayNames("en", 0)[0]).toEqual({ short: "Sun", long: "Sunday" });
    expect(weekdayNames("en", 6)[0].long).toBe("Saturday");
  });
  it("speaks a full date", () => {
    expect(dayLabel("2026-11-06")).toBe("Friday, November 6, 2026");
  });
});

describe("keepInView", () => {
  it("keeps the view while the focused day is shown", () => {
    expect(keepInView("2026-11-15", "2026-11-30")).toBe("2026-11-01");
    expect(keepInView("2026-11-01", "2026-12-31", 2)).toBe("2026-11-01");
  });
  it("follows the focused day out of either edge", () => {
    expect(keepInView("2026-11-01", "2026-10-31", 2)).toBe("2026-10-01");
    expect(keepInView("2026-11-01", "2027-01-01", 2)).toBe("2026-12-01");
    expect(keepInView("2026-11-01", "2027-06-10", 1)).toBe("2027-06-01");
  });
});
