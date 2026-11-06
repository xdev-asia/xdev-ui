import { afterEach, describe, expect, it, vi } from "vitest";
import { toast, toastDuration, toastReducer, toastStore, visibleToasts, type ToastItem } from "./toast-store";

const item = (id: string, extra: Partial<ToastItem> = {}): ToastItem => ({ id, message: id, tone: "info", ...extra });

describe("toastReducer", () => {
  it("adds to the end of the queue", () => {
    expect(toastReducer([item("a")], { type: "add", toast: item("b") }).map((t) => t.id)).toEqual(["a", "b"]);
  });
  it("adding an existing id replaces it in place", () => {
    const next = toastReducer([item("a"), item("b")], { type: "add", toast: item("a", { message: "new" }) });
    expect(next.map((t) => [t.id, t.message])).toEqual([
      ["a", "new"],
      ["b", "b"],
    ]);
  });
  it("dismisses one id, or all without an id", () => {
    expect(toastReducer([item("a"), item("b")], { type: "dismiss", id: "a" }).map((t) => t.id)).toEqual(["b"]);
    expect(toastReducer([item("a"), item("b")], { type: "dismiss" })).toEqual([]);
  });
  it("returns the same array when nothing changes", () => {
    const s = [item("a")];
    expect(toastReducer(s, { type: "dismiss", id: "zz" })).toBe(s);
  });
});

describe("visibleToasts", () => {
  it("shows the oldest `max`; the rest wait their turn", () => {
    expect(visibleToasts([item("a"), item("b"), item("c")], 2).map((t) => t.id)).toEqual(["a", "b"]);
    expect(visibleToasts([item("a")], 3)).toHaveLength(1);
  });
});

describe("toastDuration", () => {
  it("defaults to 5 s, 8 s for danger; Infinity or 0 stays until dismissed", () => {
    expect(toastDuration(item("a"))).toBe(5000);
    expect(toastDuration(item("a", { tone: "danger" }))).toBe(8000);
    expect(toastDuration(item("a", { duration: 2000 }))).toBe(2000);
    expect(toastDuration(item("a", { duration: Infinity }))).toBeNull();
    expect(toastDuration(item("a", { duration: 0 }))).toBeNull();
  });
});

describe("toast()", () => {
  afterEach(() => toast.dismiss());
  it("queues a toast, returns its id and notifies subscribers; dismiss removes it", () => {
    const listener = vi.fn();
    const off = toastStore.subscribe(listener);
    const id = toast("Saved", { tone: "ok", description: "All changes are live." });
    expect(typeof id).toBe("string");
    expect(toastStore.getSnapshot()).toEqual([{ id, message: "Saved", tone: "ok", description: "All changes are live." }]);
    toast.dismiss(id);
    expect(toastStore.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
    off();
  });
  it("ids are unique; passing an id updates that toast", () => {
    const a = toast("One");
    const b = toast("Two");
    expect(a).not.toBe(b);
    expect(toast("Uploading 50%", { id: "up" })).toBe("up");
    toast("Uploaded", { id: "up", tone: "ok" });
    expect(toastStore.getSnapshot().map((t) => t.message)).toEqual(["One", "Two", "Uploaded"]);
  });
  it("the server snapshot is always empty", () => {
    toast("x");
    expect(toastStore.getServerSnapshot()).toEqual([]);
  });
});
