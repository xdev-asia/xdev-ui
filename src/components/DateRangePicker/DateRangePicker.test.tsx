import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";
import { Calendar } from "../DatePicker/Calendar";
import { Popover } from "../Popover/Popover";

const h = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  refs: [] as Array<{ current: unknown }>,
  sets: [] as Array<ReturnType<typeof vi.fn>>,
  seed: [] as unknown[],
}));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useEffect: (fn: () => void | (() => void)) => void h.effects.push(fn),
  useRef: (v: unknown) => {
    const r = { current: v };
    h.refs.push(r);
    return r;
  },
  useState: (v: unknown) => {
    const i = h.sets.length;
    const set = vi.fn();
    h.sets.push(set);
    return [i in h.seed ? h.seed[i] : typeof v === "function" ? (v as () => unknown)() : v, set];
  },
}));
const { DateRangePicker, setRangeEnd } = await import("./DateRangePicker");

const base = { label: "Period", onChange: () => {}, today: "2026-11-06" };
const range = { start: "2026-11-10", end: "2026-11-14" };
const reset = (seed: unknown[] = []) => {
  h.seed = seed;
  h.effects.length = 0;
  h.refs.length = 0;
  h.sets.length = 0;
};
// useState order: open, focused, view, pending, hover, draft, bad
const S = { open: 0, focused: 1, view: 2, pending: 3, hover: 4, draft: 5, bad: 6 };

describe("DateRangePicker markup", () => {
  it("is a labelled group with start and end boxes and a calendar button", () => {
    reset();
    const html = renderToStaticMarkup(<DateRangePicker {...base} value={range} />);
    expect(html).toContain('role="group" aria-labelledby="x-date-range-id-label"');
    expect(html).toContain('<label id="x-date-range-id-label" for="x-date-range-id-start">Period</label>');
    expect(html).toContain('aria-label="Start date" value="10/11/2026"');
    expect(html).toContain('aria-label="End date" value="14/11/2026"');
    expect(html).toContain('aria-label="Open calendar"');
    expect(html).not.toContain('role="grid"');
  });
  it("shows two months with the range styled when open", () => {
    reset();
    const html = renderToStaticMarkup(<DateRangePicker {...base} value={{ start: "2026-11-28", end: "2026-12-03" }} defaultOpen />);
    expect(html).toContain('role="dialog" aria-label="Choose dates"');
    expect(html.match(/role="grid"/g)).toHaveLength(2);
    expect(html).toContain("November 2026");
    expect(html).toContain("December 2026");
    expect(html).toContain('data-iso="2026-11-28" data-range="start"');
    expect(html).toContain('data-iso="2026-12-01" data-range="middle"');
    expect(html).toContain('data-iso="2026-12-03" data-range="end"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(6);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  });
  it("lists presets and marks the one that matches", () => {
    reset();
    const presets = [
      { label: "Last 7 days", range: { start: "2026-10-31", end: "2026-11-06" } },
      { label: "This month", range: { start: "2026-11-01", end: "2026-11-30" } },
    ];
    const html = renderToStaticMarkup(<DateRangePicker {...base} value={presets[1].range} presets={presets} defaultOpen />);
    expect(html).toContain('role="group" aria-label="Presets"');
    expect(html).toContain('aria-pressed="false">Last 7 days</button>');
    expect(html).toContain('aria-pressed="true">This month</button>');
  });
  it("previews the range under the pointer while the end is pending", () => {
    reset([true, "2026-11-10", "2026-11-01", "2026-11-10", "2026-11-12"]);
    const html = renderToStaticMarkup(<DateRangePicker {...base} value={{ start: "2026-11-10", end: null }} />);
    expect(html).toContain('data-iso="2026-11-11" data-range="middle"');
    expect(html).toContain('data-iso="2026-11-12" data-range="end"');
  });
  it("ignores malformed ISO ends", () => {
    reset();
    const html = renderToStaticMarkup(<DateRangePicker {...base} value={{ start: "2026-02-30", end: "x" }} />);
    expect(html.match(/value=""/g)).toHaveLength(2);
  });
});

describe("DateRangePicker behaviour", () => {
  const tree = (seed: unknown[] = [], props: Record<string, unknown> = {}) => {
    reset(seed);
    const onChange = vi.fn();
    const t = DateRangePicker({ ...base, value: range, onChange, ...props });
    const set = (k: keyof typeof S) => h.sets[S[k]];
    const cal = findAll(t, (e) => e.type === Calendar)[0];
    const inputs = findAll(t, (e) => e.type === "input");
    const buttons = findAll(t, (e) => e.type === Button);
    const popover = findAll(t, (e) => e.type === Popover)[0];
    return { t, onChange, set, cal, inputs, buttons, popover };
  };

  it("first click starts a range and keeps the calendar open", () => {
    const { cal, onChange, set } = tree([true]);
    cal.props.onPick("2026-11-20");
    expect(onChange).toHaveBeenCalledWith({ start: "2026-11-20", end: null });
    expect(set("pending")).toHaveBeenCalledWith("2026-11-20");
    expect(set("open")).not.toHaveBeenCalled();
  });
  it("second click ends it, swapping an earlier day, and closes", () => {
    const { cal, onChange, set } = tree([true, "2026-11-20", "2026-11-01", "2026-11-20"]);
    cal.props.onPick("2026-11-03");
    expect(onChange).toHaveBeenCalledWith({ start: "2026-11-03", end: "2026-11-20" });
    expect(set("pending")).toHaveBeenCalledWith(null);
    expect(set("open")).toHaveBeenCalledWith(false);
  });
  it("hover only previews while an end is pending", () => {
    expect(tree([true]).cal.props.onHover).toBeUndefined();
    expect(tree([true, "2026-11-20", "2026-11-01", "2026-11-20"]).cal.props.onHover).toBeTypeOf("function");
  });
  it("keyboard moves keep the focused day in view and follow the pending preview", () => {
    const { cal, set } = tree([true, "2026-11-20", "2026-11-01", "2026-11-20"]);
    cal.props.onFocusChange("2027-01-02");
    expect(set("focused")).toHaveBeenCalledWith("2027-01-02");
    const updater = set("view").mock.calls[0][0] as (v: string) => string;
    expect(updater("2026-11-01")).toBe("2026-12-01");
    expect(set("hover")).toHaveBeenCalledWith("2027-01-02");
  });
  it("month buttons move the view and the focused day together", () => {
    const { cal, set } = tree([true, "2026-01-31", "2026-01-01"]);
    cal.props.onMonthStep(1);
    expect((set("view").mock.calls[0][0] as (v: string) => string)("2026-01-01")).toBe("2026-02-01");
    expect((set("focused").mock.calls[0][0] as (v: string) => string)("2026-01-31")).toBe("2026-02-28");
  });
  it("a preset sets the range and closes", () => {
    const presets = [{ label: "Last 7 days", range: { start: "2026-10-31", end: "2026-11-06" } }];
    const { t, onChange, set } = tree([true], { presets });
    findAll(t, (e) => e.props.className === "x-calendar-preset")[0].props.onClick();
    expect(onChange).toHaveBeenCalledWith(presets[0].range);
    expect(set("open")).toHaveBeenCalledWith(false);
  });
  it("Clear empties both ends; Today acts like a click on today", () => {
    const { buttons, onChange } = tree([true]);
    buttons[0].props.onClick();
    expect(onChange).toHaveBeenLastCalledWith({ start: null, end: null });
    buttons[1].props.onClick();
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-11-06", end: null });
  });
  it("opening focuses the start and resets the pending pick", () => {
    const { popover, set } = tree();
    popover.props.trigger({}).props.onClick();
    expect(set("focused")).toHaveBeenCalledWith("2026-11-10");
    expect(set("view")).toHaveBeenCalledWith("2026-11-01");
    expect(set("pending")).toHaveBeenCalledWith(null);
    expect(set("open")).toHaveBeenCalledWith(true);
  });
  it("typing into the end box commits on blur, swapping crossed ends", () => {
    const { inputs, onChange } = tree([false, "2026-11-10", "2026-11-01", null, null, { start: null, end: "1/11/2026" }, { start: false, end: false }]);
    inputs[1].props.onBlur();
    expect(onChange).toHaveBeenCalledWith({ start: "2026-11-01", end: "2026-11-10" });
  });
  it("typing an invalid date flags that box", () => {
    const { inputs, onChange, set } = tree([false, "2026-11-10", "2026-11-01", null, null, { start: "31/02/2026", end: null }, { start: false, end: false }]);
    inputs[0].props.onKeyDown({ key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    const flag = set("bad").mock.calls[0][0] as (b: object) => object;
    expect(flag({ start: false, end: false })).toEqual({ start: true, end: false });
  });
  it("renders the invalid message and the flagged box", () => {
    reset([false, "2026-11-10", "2026-11-01", null, null, { start: "31/02/2026", end: null }, { start: true, end: false }]);
    const html = renderToStaticMarkup(<DateRangePicker {...base} value={range} />);
    expect(html).toContain('value="31/02/2026"');
    expect(html).toContain("Enter a valid date");
    expect(html.match(/aria-invalid="true"/g)).toHaveLength(1);
  });
  it("focus effect moves into the grid once after opening", () => {
    reset();
    DateRangePicker({ ...base, value: range, defaultOpen: true });
    const [gridRef] = h.refs;
    const day = { focus: vi.fn() };
    gridRef.current = { querySelector: () => day };
    h.effects[0]();
    h.effects[0]();
    expect(day.focus).toHaveBeenCalledOnce();
  });
});

describe("setRangeEnd", () => {
  it("replaces one end and orders the ends", () => {
    expect(setRangeEnd({ start: null, end: null }, "start", "2026-11-10")).toEqual({ start: "2026-11-10", end: null });
    expect(setRangeEnd(range, "end", "2026-11-01")).toEqual({ start: "2026-11-01", end: "2026-11-10" });
    expect(setRangeEnd(range, "start", null)).toEqual({ start: null, end: "2026-11-14" });
  });
});
