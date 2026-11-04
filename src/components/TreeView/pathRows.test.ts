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

  it("returns nothing for no files", () => {
    expect(pathRows([], new Set())).toEqual([]);
  });
});
