import { describe, expect, it } from "vitest";
import { formatTime, parseTime, stepTime, timeToSeconds } from "./time-text";

describe("parseTime: time mode", () => {
  it("normalises separated fields", () => {
    expect(parseTime("9:5")).toBe("09:05");
    expect(parseTime(" 09:30 ")).toBe("09:30");
    expect(parseTime("9.30")).toBe("09:30");
    expect(parseTime("23:59")).toBe("23:59");
    expect(parseTime("0:0")).toBe("00:00");
  });
  it("splits digits only: 1–2 are hours, 3–4 end in minutes", () => {
    expect(parseTime("9")).toBe("09:00");
    expect(parseTime("930")).toBe("09:30");
    expect(parseTime("0930")).toBe("09:30");
    expect(parseTime("2359")).toBe("23:59");
    expect(parseTime("12345")).toBeNull();
  });
  it("rejects out of range and malformed text", () => {
    for (const t of ["24:00", "12:60", "960", "2400", "abc", "9:", ":30", "9:300", "1:2:3:4", "-1:00", "9 30", "09:30:15"]) expect(parseTime(t), t).toBeNull();
  });
  it("returns null for empty text", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime("   ")).toBeNull();
  });
});

describe("parseTime: seconds", () => {
  const o = { seconds: true };
  it("reads three fields and pads a missing seconds field", () => {
    expect(parseTime("1:02:03", o)).toBe("01:02:03");
    expect(parseTime("09:30", o)).toBe("09:30:00");
    expect(parseTime("23:59:59", o)).toBe("23:59:59");
  });
  it("splits 5–6 digits into hours, minutes, seconds", () => {
    expect(parseTime("10203", o)).toBe("01:02:03");
    expect(parseTime("235959", o)).toBe("23:59:59");
    expect(parseTime("930", o)).toBe("09:30:00");
  });
  it("rejects bad seconds", () => {
    expect(parseTime("09:30:60", o)).toBeNull();
    expect(parseTime("093060", o)).toBeNull();
    expect(parseTime("1234567", o)).toBeNull();
  });
});

describe("parseTime: duration", () => {
  const o = { mode: "duration" as const };
  it("reads mm:ss", () => {
    expect(parseTime("3:45", o)).toBe("03:45");
    expect(parseTime("59:59", o)).toBe("59:59");
    expect(parseTime("0:5", o)).toBe("00:05");
  });
  it("reads 1–2 digits as seconds, 3+ as minutes then two digits of seconds", () => {
    expect(parseTime("45", o)).toBe("00:45");
    expect(parseTime("90", o)).toBeNull();
    expect(parseTime("130", o)).toBe("01:30");
    expect(parseTime("0130", o)).toBe("01:30");
  });
  it("keeps minutes within maxMinutes and seconds below 60", () => {
    expect(parseTime("60:00", o)).toBeNull();
    expect(parseTime("3:60", o)).toBeNull();
    expect(parseTime("1:2:3", o)).toBeNull();
    expect(parseTime("120:00", { ...o, maxMinutes: 120 })).toBe("120:00");
    expect(parseTime("12000", { ...o, maxMinutes: 120 })).toBe("120:00");
    expect(parseTime("120:01", { ...o, maxMinutes: 120 })).toBe("120:01");
    expect(parseTime("121:00", { ...o, maxMinutes: 120 })).toBeNull();
    expect(parseTime("5:00", { ...o, maxMinutes: 4 })).toBeNull();
  });
});

describe("formatTime / timeToSeconds / stepTime", () => {
  it("formats and wraps seconds", () => {
    expect(formatTime(9 * 3600 + 5 * 60)).toBe("09:05");
    expect(formatTime(-60)).toBe("23:59");
    expect(formatTime(24 * 3600)).toBe("00:00");
    expect(formatTime(3723, { seconds: true })).toBe("01:02:03");
    expect(formatTime(225, { mode: "duration" })).toBe("03:45");
    expect(formatTime(3600, { mode: "duration" })).toBe("00:00");
    expect(formatTime(7200, { mode: "duration", maxMinutes: 120 })).toBe("120:00");
  });
  it("converts a value to seconds", () => {
    expect(timeToSeconds("01:02")).toBe(3720);
    expect(timeToSeconds("01:02:03", { seconds: true })).toBe(3723);
    expect(timeToSeconds("03:45", { mode: "duration" })).toBe(225);
    expect(timeToSeconds("nope")).toBeNull();
    expect(timeToSeconds(null)).toBeNull();
  });
  it("steps a minute (time) or a second (duration), wrapping", () => {
    expect(stepTime("09:30", 1)).toBe("09:31");
    expect(stepTime("23:59", 1)).toBe("00:00");
    expect(stepTime("00:00", -1)).toBe("23:59");
    expect(stepTime("09:30:15", 1, { seconds: true })).toBe("09:31:15");
    expect(stepTime("00:59", 1, { mode: "duration" })).toBe("01:00");
    expect(stepTime("59:59", 1, { mode: "duration" })).toBe("00:00");
    expect(stepTime("00:00", -1, { mode: "duration" })).toBe("59:59");
    expect(stepTime("00:00", -1, { mode: "duration", maxMinutes: 120 })).toBe("120:59");
  });
  it("starts from 00:00 without a valid value", () => {
    expect(stepTime(null, 1)).toBe("00:01");
    expect(stepTime("x", -1)).toBe("23:59");
  });
});
