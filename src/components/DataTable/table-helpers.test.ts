import { describe, expect, it } from "vitest";
import { nextSort, pageSlice, sortRows } from "./table-helpers";

describe("nextSort", () => {
  it("cycles asc, desc, off", () => {
    const a = nextSort(null, "name");
    expect(a).toEqual({ key: "name", dir: "asc" });
    const d = nextSort(a, "name");
    expect(d).toEqual({ key: "name", dir: "desc" });
    expect(nextSort(d, "name")).toBeNull();
  });
  it("restarts at asc for a different column", () => {
    expect(nextSort({ key: "name", dir: "desc" }, "role")).toEqual({ key: "role", dir: "asc" });
    expect(nextSort(undefined, "x")).toEqual({ key: "x", dir: "asc" });
  });
});

describe("sortRows", () => {
  const rows = [
    { id: 1, n: "b", k: 2 },
    { id: 2, n: "a", k: 2 },
    { id: 3, n: "c", k: 1 },
    { id: 4, n: "a", k: 2 },
  ];
  const value = (r: (typeof rows)[number], key: string) => (r as Record<string, string | number>)[key];
  it("returns a copy in the same order without a sort", () => {
    const out = sortRows(rows, null, value);
    expect(out).toEqual(rows);
    expect(out).not.toBe(rows);
  });
  it("sorts strings and numbers, ascending and descending", () => {
    expect(sortRows(rows, { key: "n", dir: "asc" }, value).map((r) => r.n)).toEqual(["a", "a", "b", "c"]);
    expect(sortRows(rows, { key: "k", dir: "desc" }, value).map((r) => r.k)).toEqual([2, 2, 2, 1]);
    expect(sortRows([{ n: "item 10" }, { n: "item 9" }], { key: "n", dir: "asc" }, (r) => r.n).map((r) => r.n)).toEqual(["item 9", "item 10"]);
  });
  it("is stable for equal keys in both directions", () => {
    expect(sortRows(rows, { key: "n", dir: "asc" }, value).filter((r) => r.n === "a").map((r) => r.id)).toEqual([2, 4]);
    expect(sortRows(rows, { key: "k", dir: "asc" }, value).filter((r) => r.k === 2).map((r) => r.id)).toEqual([1, 2, 4]);
    expect(sortRows(rows, { key: "k", dir: "desc" }, value).filter((r) => r.k === 2).map((r) => r.id)).toEqual([1, 2, 4]);
  });
});

describe("pageSlice", () => {
  const rows = Array.from({ length: 5 }, (_, i) => i + 1);
  it("slices 1-based pages", () => {
    expect(pageSlice(rows, 1, 2)).toEqual([1, 2]);
    expect(pageSlice(rows, 3, 2)).toEqual([5]);
  });
  it("clamps the page into range", () => {
    expect(pageSlice(rows, 0, 2)).toEqual([1, 2]);
    expect(pageSlice(rows, 99, 2)).toEqual([5]);
  });
  it("handles empty rows and a bad page size", () => {
    expect(pageSlice([], 1, 10)).toEqual([]);
    expect(pageSlice(rows, 1, 0)).toEqual([1]);
  });
});
