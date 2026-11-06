import { describe, expect, it } from "vitest";
import { moveItem, reorderKeyStep, reorderSlot, slotToIndex, type ReorderKeyState } from "./table-reorder";

describe("moveItem", () => {
  const a = ["a", "b", "c", "d"];
  it("moves down and up and returns a copy", () => {
    expect(moveItem(a, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(a, 3, 1)).toEqual(["a", "d", "b", "c"]);
    const same = moveItem(a, 1, 1);
    expect(same).toEqual(a);
    expect(same).not.toBe(a);
    expect(a).toEqual(["a", "b", "c", "d"]);
  });
  it("clamps the target and ignores a bad source", () => {
    expect(moveItem(a, 0, 99)).toEqual(["b", "c", "d", "a"]);
    expect(moveItem(a, 2, -5)).toEqual(["c", "a", "b", "d"]);
    expect(moveItem(a, 9, 0)).toEqual(a);
    expect(moveItem(a, -1, 0)).toEqual(a);
    expect(moveItem([], 0, 0)).toEqual([]);
  });
});

describe("reorderKeyStep", () => {
  const run = (keys: string[], index = 1, count = 4) => {
    let state: ReorderKeyState = null;
    const events = [];
    for (const k of keys) {
      const r = reorderKeyStep(state, k, index, count);
      state = r.state;
      events.push(r.event);
    }
    return { state, events };
  };
  it("Space or Enter lifts the focused row", () => {
    expect(reorderKeyStep(null, " ", 2, 4)).toEqual({ state: { from: 2, at: 2 }, event: { type: "lift", from: 2 }, handled: true });
    expect(reorderKeyStep(null, "Enter", 0, 4).state).toEqual({ from: 0, at: 0 });
  });
  it("ignores other keys while idle", () => {
    expect(reorderKeyStep(null, "ArrowDown", 0, 4)).toEqual({ state: null, event: null, handled: false });
    expect(reorderKeyStep(null, " ", 0, 0).handled).toBe(false);
  });
  it("arrows move the lifted row and announce each step", () => {
    const { state, events } = run([" ", "ArrowDown", "ArrowDown"]);
    expect(state).toEqual({ from: 1, at: 3 });
    expect(events).toEqual([{ type: "lift", from: 1 }, { type: "move", from: 1, to: 2 }, { type: "move", from: 1, to: 3 }]);
  });
  it("stops at the ends without an event", () => {
    const r = reorderKeyStep({ from: 3, at: 3 }, "ArrowDown", 3, 4);
    expect(r).toEqual({ state: { from: 3, at: 3 }, event: null, handled: true });
    expect(reorderKeyStep({ from: 0, at: 0 }, "ArrowUp", 0, 4).event).toBeNull();
    expect(reorderKeyStep({ from: 2, at: 2 }, "Home", 2, 4).state).toEqual({ from: 2, at: 0 });
    expect(reorderKeyStep({ from: 0, at: 0 }, "End", 0, 4).state).toEqual({ from: 0, at: 3 });
  });
  it("Space or Enter drops; Escape cancels", () => {
    expect(run([" ", "ArrowUp", "Enter"]).events.at(-1)).toEqual({ type: "drop", from: 1, to: 0 });
    expect(run([" ", "ArrowUp", "Enter"]).state).toBeNull();
    expect(run(["Enter", "ArrowDown", "Escape"])).toEqual({ state: null, events: [{ type: "lift", from: 1 }, { type: "move", from: 1, to: 2 }, { type: "cancel", from: 1 }] });
  });
  it("leaves unrelated keys to the browser while lifted", () => {
    expect(reorderKeyStep({ from: 1, at: 2 }, "Tab", 1, 4)).toEqual({ state: { from: 1, at: 2 }, event: null, handled: false });
  });
});

describe("reorderSlot / slotToIndex", () => {
  const mids = [10, 30, 50, 70];
  it("counts the midpoints above the pointer", () => {
    expect(reorderSlot(0, mids)).toBe(0);
    expect(reorderSlot(31, mids)).toBe(2);
    expect(reorderSlot(99, mids)).toBe(4);
  });
  it("maps an insertion slot to the final index", () => {
    expect(slotToIndex(1, 0)).toBe(0);
    expect(slotToIndex(1, 1)).toBe(1);
    expect(slotToIndex(1, 2)).toBe(1);
    expect(slotToIndex(1, 4)).toBe(3);
  });
});
