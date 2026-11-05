import { describe, expect, it } from "vitest";
import { nextTableSort, paginateRows, sortTableRows } from "./table-helpers";

describe("nextTableSort", () => {
  it("cycles asc, desc, off", () => {
    const a = nextTableSort(null, "name");
    expect(a).toEqual({ key: "name", dir: "asc" });
    const d = nextTableSort(a, "name");
    expect(d).toEqual({ key: "name", dir: "desc" });
    expect(nextTableSort(d, "name")).toBeNull();
  });
  it("restarts at asc for a different column", () => {
    expect(nextTableSort({ key: "name", dir: "desc" }, "role")).toEqual({ key: "role", dir: "asc" });
    expect(nextTableSort(undefined, "x")).toEqual({ key: "x", dir: "asc" });
  });
});

describe("sortTableRows", () => {
  const rows = [
    { id: 1, n: "b", k: 2 },
    { id: 2, n: "a", k: 2 },
    { id: 3, n: "c", k: 1 },
    { id: 4, n: "a", k: 2 },
  ];
  const value = (r: (typeof rows)[number], key: string) => (r as Record<string, string | number>)[key];
  it("returns a copy in the same order without a sort", () => {
    const out = sortTableRows(rows, null, value);
    expect(out).toEqual(rows);
    expect(out).not.toBe(rows);
  });
  it("sorts strings and numbers, ascending and descending", () => {
    expect(sortTableRows(rows, { key: "n", dir: "asc" }, value).map((r) => r.n)).toEqual(["a", "a", "b", "c"]);
    expect(sortTableRows(rows, { key: "k", dir: "desc" }, value).map((r) => r.k)).toEqual([2, 2, 2, 1]);
    expect(sortTableRows([{ n: "item 10" }, { n: "item 9" }], { key: "n", dir: "asc" }, (r) => r.n).map((r) => r.n)).toEqual(["item 9", "item 10"]);
  });
  it("is stable for equal keys in both directions", () => {
    expect(sortTableRows(rows, { key: "n", dir: "asc" }, value).filter((r) => r.n === "a").map((r) => r.id)).toEqual([2, 4]);
    expect(sortTableRows(rows, { key: "k", dir: "asc" }, value).filter((r) => r.k === 2).map((r) => r.id)).toEqual([1, 2, 4]);
    expect(sortTableRows(rows, { key: "k", dir: "desc" }, value).filter((r) => r.k === 2).map((r) => r.id)).toEqual([1, 2, 4]);
  });
});

describe("paginateRows", () => {
  const rows = Array.from({ length: 5 }, (_, i) => i + 1);
  it("slices 1-based pages", () => {
    expect(paginateRows(rows, 1, 2)).toEqual([1, 2]);
    expect(paginateRows(rows, 3, 2)).toEqual([5]);
  });
  it("clamps the page into range", () => {
    expect(paginateRows(rows, 0, 2)).toEqual([1, 2]);
    expect(paginateRows(rows, 99, 2)).toEqual([5]);
  });
  it("handles empty rows and a bad page size", () => {
    expect(paginateRows([], 1, 10)).toEqual([]);
    expect(paginateRows(rows, 1, 0)).toEqual([1]);
  });
});
