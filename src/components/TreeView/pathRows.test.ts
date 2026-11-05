import { describe, expect, it } from "vitest";
import { pathRows } from "./pathRows";

describe("pathRows", () => {
  it("nests files under their folders, folders first, sorted by name", () => {
    const rows = pathRows(
      [{ path: "src/b.ts" }, { path: "README.md" }, { path: "src/a/x.ts" }, { path: "src/a.ts" }],
      new Set(),
    );
    expect(rows.map((r) => [r.id, r.depth, r.kind])).toEqual([
      ["src/", 0, "dir"],
      ["src/a/", 1, "dir"],
      ["src/a/x.ts", 2, "file"],
      ["src/a.ts", 1, "file"],
      ["src/b.ts", 1, "file"],
      ["README.md", 0, "file"],
    ]);
    expect(rows[0]).toMatchObject({ name: "src", open: true });
  });

  it("hides the children of a closed folder", () => {
    const rows = pathRows([{ path: "src/a.ts" }, { path: "src/lib/b.ts" }, { path: "z.ts" }], new Set(["src/"]));
    expect(rows.map((r) => r.id)).toEqual(["src/", "z.ts"]);
    expect(rows[0].open).toBe(false);
  });

  it("marks a folder as changed when it holds a marked file", () => {
    const rows = pathRows([{ path: "a/b/c.ts", mark: "modified" }, { path: "a/d.ts" }, { path: "e/f.ts" }], new Set());
    const by = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(by["a/"].changed).toBe(true);
    expect(by["a/b/"].changed).toBe(true);
    expect(by["e/"].changed).toBeFalsy();
    expect(by["a/b/c.ts"].mark).toBe("modified");
    expect(by["a/d.ts"].mark).toBeUndefined();
  });

  it("draws one file at the root", () => {
    expect(pathRows([{ path: "only.md" }], new Set())).toEqual([{ id: "only.md", depth: 0, name: "only.md", kind: "file", mark: undefined }]);
  });

  it("merges a chain of single-child folders and counts the files under each folder", () => {
    const files = [{ path: "a/b/c/x.ts", mark: "added" as const }, { path: "a/b/c/y.ts" }, { path: "a/b/c/d/z.ts" }, { path: "top.ts" }];
    const rows = pathRows(files, new Set(), { compact: true });
    expect(rows.map((r) => [r.id, r.name, r.depth, r.count])).toEqual([
      ["a/b/c/", "a/b/c", 0, 3],
      ["a/b/c/d/", "d", 1, 1],
      ["a/b/c/d/z.ts", "z.ts", 2, undefined],
      ["a/b/c/x.ts", "x.ts", 1, undefined],
      ["a/b/c/y.ts", "y.ts", 1, undefined],
      ["top.ts", "top.ts", 0, undefined],
    ]);
    expect(rows[0]).toMatchObject({ kind: "dir", open: true, changed: true });
  });

  it("does not merge a folder that also holds a file or two folders", () => {
    const rows = pathRows([{ path: "a/f.ts" }, { path: "a/b/g.ts" }, { path: "c/d/h.ts" }, { path: "c/e/i.ts" }], new Set(), { compact: true });
    expect(rows.filter((r) => r.kind === "dir").map((r) => r.name)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("closes a merged folder by its deepest id", () => {
    const rows = pathRows([{ path: "a/b/x.ts" }], new Set(["a/b/"]), { compact: true });
    expect(rows).toEqual([{ id: "a/b/", depth: 0, name: "a/b", kind: "dir", open: false, count: 1 }]);
  });

  it("leaves rows as they were without the compact option", () => {
    const rows = pathRows([{ path: "a/b/x.ts" }], new Set());
    expect(rows.map((r) => r.id)).toEqual(["a/", "a/b/", "a/b/x.ts"]);
    expect(rows.every((r) => r.count === undefined)).toBe(true);
  });

  it("returns nothing for no files", () => {
    expect(pathRows([], new Set())).toEqual([]);
  });
});
