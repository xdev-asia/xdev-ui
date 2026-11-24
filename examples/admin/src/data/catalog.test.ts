import { describe, expect, it } from "vitest";
import { branchIds, categoryShare, countNodes, filterTree, updateNode, seedDepartments, seedMenus, visibleRows, visitSeries, type TreeNode } from "./catalog";

const tree: TreeNode<string>[] = [
  { id: "a", data: "Alpha", children: [{ id: "a1", data: "Alpha one" }, { id: "a2", data: "Beta two", children: [{ id: "a2x", data: "Gamma" }] }] },
  { id: "b", data: "Beta" },
];

describe("visibleRows", () => {
  it("shows only the roots when nothing is open", () => {
    expect(visibleRows(tree, new Set()).map((r) => [r.id, r.depth, r.hasChildren, r.expanded])).toEqual([
      ["a", 0, true, false],
      ["b", 0, false, false],
    ]);
  });
  it("opens nodes depth first and keeps closed grandchildren hidden", () => {
    expect(visibleRows(tree, new Set(["a"])).map((r) => `${r.id}@${r.depth}<${r.parent}`)).toEqual(["a@0<null", "a1@1<a", "a2@1<a", "b@0<null"]);
    expect(visibleRows(tree, new Set(["a", "a2"])).map((r) => r.id)).toEqual(["a", "a1", "a2", "a2x", "b"]);
  });
  it("ignores an open child under a closed parent", () => {
    expect(visibleRows(tree, new Set(["a2"])).map((r) => r.id)).toEqual(["a", "b"]);
  });
});

describe("branchIds and filterTree", () => {
  it("lists every node with children", () => {
    expect(branchIds(tree)).toEqual(["a", "a2"]);
  });
  it("keeps the ancestors of a match", () => {
    const f = filterTree(tree, (d) => d.includes("Gamma"));
    expect(visibleRows(f, new Set(branchIds(f))).map((r) => r.id)).toEqual(["a", "a2", "a2x"]);
  });
  it("returns nothing when nothing matches", () => {
    expect(filterTree(tree, () => false)).toEqual([]);
  });
});

describe("seed data", () => {
  it("has unique ids in the menu and department trees", () => {
    for (const t of [seedMenus(), seedDepartments()] as TreeNode<unknown>[][]) {
      const ids = visibleRows(t, new Set(branchIds(t))).map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("gives 7, 30 and 12 buckets, oldest first", () => {
    for (const [p, n] of [["week", 7], ["month", 30], ["year", 12]] as const) {
      const s = visitSeries(p);
      expect(s).toHaveLength(n);
      expect(s.every((x, i) => i === 0 || x.at > s[i - 1].at)).toBe(true);
    }
  });
  it("sorts category share largest first and sums to 100", () => {
    for (const c of ["all", "online", "store"] as const) {
      const s = categoryShare(c);
      expect(s.reduce((n, x) => n + x.value, 0)).toBe(100);
      expect(s.every((x, i) => i === 0 || x.value <= s[i - 1].value)).toBe(true);
    }
  });
});

describe("updateNode and countNodes", () => {
  it("replaces one node deep in the tree and leaves the rest alone", () => {
    const next = updateNode(tree, "a2x", "Delta");
    expect(visibleRows(next, new Set(["a", "a2"])).map((r) => r.data)).toEqual(["Alpha", "Alpha one", "Beta two", "Delta", "Beta"]);
    expect(next[1]).toBe(tree[1]);
  });
  it("counts every node", () => {
    expect(countNodes(tree)).toBe(5);
  });
});
