import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Popover } from "../Popover/Popover";

const h = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  refs: [] as Array<{ current: unknown }>,
  sets: [] as Array<ReturnType<typeof vi.fn>>,
  /** Initial values for the nth useState of the next render (draft text, bad flag). */
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
const { DatePicker } = await import("./DatePicker");
const { Calendar, calendarKey, monthStepAllowed } = await import("./Calendar");

const base = { label: "Due date", onChange: () => {}, today: "2026-11-06" };
const reset = (seed: unknown[] = []) => {
  h.seed = seed;
  h.effects.length = 0;
  h.refs.length = 0;
  h.sets.length = 0;
};

describe("DatePicker markup", () => {
  it("is a labelled text box with a calendar button, closed by default", () => {
    const html = renderToStaticMarkup(<DatePicker {...base} value="2026-11-06" />);
    expect(html).toContain('<label for="x-date-id">Due date</label>');
    expect(html).toContain('id="x-date-id" type="text" inputMode="numeric"');
    expect(html).toContain('placeholder="dd/mm/yyyy" value="06/11/2026"');
    expect(html).toContain('aria-label="Open calendar"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('role="grid"');
  });
  it("shows an empty box for null or a malformed value", () => {
    expect(renderToStaticMarkup(<DatePicker {...base} value={null} />)).toContain('value=""');
    expect(renderToStaticMarkup(<DatePicker {...base} value="06/11/2026" />)).toContain('value=""');
  });
  it("uses the format for display and placeholder", () => {
    const html = renderToStaticMarkup(<DatePicker {...base} value="2026-11-06" format="yyyy-mm-dd" />);
    expect(html).toContain('placeholder="yyyy-mm-dd" value="2026-11-06"');
  });
  it("renders the WAI-ARIA grid when open", () => {
    const html = renderToStaticMarkup(<DatePicker {...base} value="2026-11-10" defaultOpen />);
    expect(html).toContain('role="dialog" aria-label="Choose date"');
    expect(html).toContain('role="grid" aria-labelledby="x-date-id-cal-2026-11"');
    expect(html).toContain('id="x-date-id-cal-2026-11" aria-live="polite">November 2026</h2>');
    expect(html).toContain('<th scope="col" abbr="Monday">Mon</th>');
    // selected day holds the roving tabindex; today is aria-current
    expect(html).toMatch(/tabindex="0" aria-selected="true" aria-label="Tuesday, November 10, 2026"/);
    expect(html).toMatch(/tabindex="-1" aria-selected="false" aria-current="date" aria-label="Friday, November 6, 2026"/);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html.match(/data-iso="2026-11-/g)).toHaveLength(30);
    expect(html).toContain('aria-label="Previous month"');
    expect(html).toContain('aria-label="Next month"');
    expect(html).toContain(">Today</button>");
    expect(html).toContain(">Clear</button>");
  });
  it("names months and weekdays with the locale and starts the week on weekStartsOn", () => {
    const html = renderToStaticMarkup(<DatePicker {...base} value="2026-11-10" defaultOpen weekStartsOn={0} locale="vi" />);
    const first = html.match(/<th scope="col" abbr="([^"]+)"/)![1];
    expect(first).toBe(new Intl.DateTimeFormat("vi", { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7))));
    expect(html).not.toContain("November");
  });
  it("marks days outside min/max and isDateDisabled", () => {
    const html = renderToStaticMarkup(
      <DatePicker {...base} value="2026-11-10" min="2026-11-03" max="2026-11-20" isDateDisabled={(d) => d === "2026-11-12"} defaultOpen />,
    );
    expect(html).toMatch(/aria-disabled="true" aria-label="Monday, November 2, 2026"/);
    expect(html).toMatch(/aria-disabled="true" aria-label="Thursday, November 12, 2026"/);
    expect(html).toMatch(/aria-disabled="true" aria-label="Saturday, November 21, 2026"/);
    expect(html).not.toMatch(/aria-disabled="true" aria-label="Tuesday, November 3, 2026"/);
    // both month buttons are disabled: November is the only month in range
    expect(html.match(/aria-label="(Previous|Next) month" title="[^"]+" disabled=""/g)).toHaveLength(2);
  });
  it("starts on a clamped day when today is outside min/max", () => {
    const html = renderToStaticMarkup(<DatePicker {...base} value={null} min="2027-01-10" defaultOpen />);
    expect(html).toContain("January 2027");
    expect(html).toMatch(/tabindex="0" aria-selected="false" aria-label="Sunday, January 10, 2027"/);
    expect(html).toMatch(/disabled="">Today</);
  });
  it("shows hint, error and disabled state", () => {
    const hint = renderToStaticMarkup(<DatePicker {...base} value={null} hint="When the task is due." />);
    expect(hint).toContain('aria-describedby="x-date-id-note"');
    expect(hint).toContain('<small id="x-date-id-note">When the task is due.</small>');
    const err = renderToStaticMarkup(<DatePicker {...base} value={null} error="Pick a date." />);
    expect(err).toContain("data-invalid");
    expect(err).toContain('aria-invalid="true"');
    const off = renderToStaticMarkup(<DatePicker {...base} value={null} disabled />);
    expect(off.match(/\sdisabled=""/g)).toHaveLength(2);
    expect(off).toContain("data-disabled");
  });
  it("carries the ISO value in a hidden input when named", () => {
    expect(renderToStaticMarkup(<DatePicker {...base} value="2026-11-06" name="due" />)).toContain('<input type="hidden" name="due" value="2026-11-06"/>');
  });
});

describe("DatePicker behaviour", () => {
  const tree = (props: Partial<Parameters<typeof DatePicker>[0]> = {}) => {
    reset();
    const onChange = vi.fn();
    const t = DatePicker({ ...base, value: "2026-11-06", onChange, ...props });
    const [setOpen, setFocused, setDraft, setBad] = h.sets;
    const input = findAll(t, (e) => e.type === "input" && e.props.type === "text")[0];
    const popover = findAll(t, (e) => e.type === Popover)[0];
    const cal = findAll(t, (e) => e.type === Calendar)[0];
    const buttons = findAll(t, (e) => e.type === Button);
    return { t, onChange, setOpen, setFocused, setDraft, setBad, input, popover, cal, buttons };
  };

  it("commits typed text on blur and Enter", () => {
    const { input, setDraft, setBad } = tree();
    input.props.onChange({ target: { value: "7/11/2026" } });
    expect(setDraft).toHaveBeenCalledWith("7/11/2026");
    expect(setBad).toHaveBeenCalledWith(false);
  });
  it("picks a day from the calendar and closes", () => {
    const { cal, onChange, setOpen } = tree();
    cal.props.onPick("2026-11-20");
    expect(onChange).toHaveBeenCalledWith("2026-11-20");
    expect(setOpen).toHaveBeenCalledWith(false);
  });
  it("Today picks today, Clear clears", () => {
    const { buttons, onChange } = tree();
    buttons[1].props.onClick();
    expect(onChange).toHaveBeenLastCalledWith("2026-11-06");
    buttons[0].props.onClick();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
  it("opens on the calendar button, focused on the value, and moves focus into the grid", () => {
    const { popover, setOpen, setFocused } = tree({ value: "2026-11-20" });
    const trigger = popover.props.trigger({ "aria-expanded": false, "aria-controls": "p", "aria-haspopup": "dialog" });
    expect(trigger.type).toBe(IconButton);
    trigger.props.onClick();
    expect(setFocused).toHaveBeenCalledWith("2026-11-20");
    expect(setOpen).toHaveBeenCalledWith(true);
    const moveFocus = h.refs[1];
    expect(moveFocus.current).toBe(true);
  });
  it("Escape closes through Popover's onClose", () => {
    const { popover, setOpen } = tree();
    popover.props.onClose();
    expect(setOpen).toHaveBeenCalledWith(false);
  });
  it("Alt+ArrowDown in the box opens the calendar", () => {
    const { input, setOpen } = tree();
    const e = { key: "ArrowDown", altKey: true, preventDefault: vi.fn() };
    input.props.onKeyDown(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(true);
  });
  it("the focus effect focuses the roving day after opening", () => {
    reset();
    DatePicker({ ...base, value: "2026-11-06", defaultOpen: true });
    const [gridRef] = h.refs;
    const day = { focus: vi.fn() };
    gridRef.current = { querySelector: (s: string) => (s === '[tabindex="0"]' ? day : null) };
    h.effects[0]();
    expect(day.focus).toHaveBeenCalledOnce();
    h.effects[0]();
    expect(day.focus).toHaveBeenCalledOnce(); // only once per request
  });
});

describe("DatePicker typing", () => {
  // useState order: open, focused, draft, bad
  const typed = (draft: string | null, props: Record<string, unknown> = {}) => {
    reset([false, "2026-11-06", draft, false]);
    const onChange = vi.fn();
    const t = DatePicker({ ...base, value: "2026-11-06", onChange, ...props });
    const input = findAll(t, (e) => e.type === "input" && e.props.type === "text")[0];
    return { input, onChange, setFocused: h.sets[1], setDraft: h.sets[2], setBad: h.sets[3] };
  };
  it("shows the draft while typing", () => {
    expect(typed("7/11").input.props.value).toBe("7/11");
    expect(typed(null).input.props.value).toBe("06/11/2026");
  });
  it("commits a valid date on blur", () => {
    const { input, onChange, setDraft, setFocused } = typed("7.11.2026");
    input.props.onBlur();
    expect(onChange).toHaveBeenCalledWith("2026-11-07");
    expect(setDraft).toHaveBeenCalledWith(null);
    expect(setFocused).toHaveBeenCalledWith("2026-11-07");
  });
  it("commits on Enter", () => {
    const { input, onChange } = typed("1-12-2026");
    input.props.onKeyDown({ key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("2026-12-01");
  });
  it("does nothing without a draft", () => {
    const { input, onChange, setBad } = typed(null);
    input.props.onBlur();
    expect(onChange).not.toHaveBeenCalled();
    expect(setBad).not.toHaveBeenCalled();
  });
  it("clears the value when the box is emptied", () => {
    const { input, onChange } = typed("  ");
    input.props.onBlur();
    expect(onChange).toHaveBeenCalledWith(null);
  });
  it("flags an impossible date and keeps the value", () => {
    const { input, onChange, setBad } = typed("31/02/2026");
    input.props.onBlur();
    expect(onChange).not.toHaveBeenCalled();
    expect(setBad).toHaveBeenCalledWith(true);
  });
  it("flags a date outside min/max or rejected by isDateDisabled", () => {
    let r = typed("01/01/2020", { min: "2026-01-01" });
    r.input.props.onBlur();
    expect(r.setBad).toHaveBeenCalledWith(true);
    r = typed("07/11/2026", { isDateDisabled: () => true });
    r.input.props.onBlur();
    expect(r.onChange).not.toHaveBeenCalled();
    expect(r.setBad).toHaveBeenCalledWith(true);
  });
  it("renders the invalid message from labels when flagged", () => {
    reset([false, "2026-11-06", "31/02/2026", true]);
    const html = renderToStaticMarkup(<DatePicker {...base} value={null} labels={{ invalid: "Ngày không hợp lệ" }} />);
    expect(html).toContain("Ngày không hợp lệ");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('value="31/02/2026"');
    reset();
  });
});

describe("Calendar", () => {
  const props = {
    view: "2026-11-10",
    months: 1 as const,
    focused: "2026-11-10",
    today: "2026-11-06",
    locale: "en",
    weekStartsOn: 1 as const,
    range: { start: "2026-11-10", end: "2026-11-10" },
    onFocusChange: vi.fn(),
    onMonthStep: vi.fn(),
    onPick: vi.fn(),
    labels: { previousMonth: "Previous month", nextMonth: "Next month" },
    idBase: "c",
  };
  it("routes grid keys: arrows move focus, Enter and Space pick, others pass", () => {
    const onFocusChange = vi.fn();
    const onPick = vi.fn();
    const tree = Calendar({ ...props, onFocusChange, onPick });
    const [months] = findAll(tree, (e) => e.props.className === "x-calendar-months");
    const key = (k: string, shiftKey = false) => {
      const e = { key: k, shiftKey, preventDefault: vi.fn() };
      months.props.onKeyDown(e);
      return e;
    };
    expect(key("ArrowDown").preventDefault).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenLastCalledWith("2026-11-17");
    key("PageUp", true);
    expect(onFocusChange).toHaveBeenLastCalledWith("2025-11-10");
    key("Enter");
    expect(onPick).toHaveBeenLastCalledWith("2026-11-10");
    key(" ");
    expect(onPick).toHaveBeenCalledTimes(2);
    expect(key("Tab").preventDefault).not.toHaveBeenCalled();
  });
  it("month buttons step by one", () => {
    const onMonthStep = vi.fn();
    const [prev, next] = findAll(Calendar({ ...props, onMonthStep }), (e) => e.type === IconButton);
    prev.props.onClick();
    next.props.onClick();
    expect(onMonthStep.mock.calls).toEqual([[-1], [1]]);
  });
  it("clicking an enabled day picks it; a disabled one has no handler", () => {
    const onPick = vi.fn();
    const html = renderToStaticMarkup(<Calendar {...props} onPick={onPick} isDateDisabled={(d) => d === "2026-11-11"} />);
    expect(html).toMatch(/aria-disabled="true" aria-label="Wednesday, November 11, 2026"/);
    const cells = findAll(Calendar({ ...props, onPick, isDateDisabled: (d: string) => d === "2026-11-11" }), (e) => e.type === "td" && e.props["data-iso"]);
    cells.find((c) => c.props["data-iso"] === "2026-11-12")!.props.onClick();
    expect(onPick).toHaveBeenCalledWith("2026-11-12");
    expect(cells.find((c) => c.props["data-iso"] === "2026-11-11")!.props.onClick).toBeUndefined();
  });
  it("styles a range: start, middle, end; leaves outside-month cells blank", () => {
    const html = renderToStaticMarkup(<Calendar {...props} months={2} range={{ start: "2026-11-28", end: "2026-12-02" }} />);
    expect(html).toContain('data-iso="2026-11-28" data-range="start"');
    expect(html).toContain('data-iso="2026-11-30" data-range="middle"');
    expect(html).toContain('data-iso="2026-12-01" data-range="middle"');
    expect(html).toContain('data-iso="2026-12-02" data-range="end"');
    expect(html).toContain("December 2026");
    expect(html).toContain('<td class="x-calendar-day" data-outside=""></td>');
    expect(html.match(/data-iso="2026-11-28"/g)).toHaveLength(1);
  });
  it("orders a reversed range", () => {
    const html = renderToStaticMarkup(<Calendar {...props} range={{ start: "2026-11-20", end: "2026-11-18" }} />);
    expect(html).toContain('data-iso="2026-11-18" data-range="start"');
    expect(html).toContain('data-iso="2026-11-20" data-range="end"');
  });
});

describe("calendarKey / monthStepAllowed", () => {
  it("clamps moves to min and max and refuses to pick a disabled day", () => {
    expect(calendarKey("ArrowLeft", "2026-11-03", { min: "2026-11-03" })).toEqual({ move: "2026-11-03" });
    expect(calendarKey("PageDown", "2026-11-03", { max: "2026-11-20" })).toEqual({ move: "2026-11-20" });
    expect(calendarKey("Enter", "2026-11-03", { isDateDisabled: () => true })).toBeNull();
    expect(calendarKey("End", "2026-11-03", { weekStartsOn: 0 })).toEqual({ move: "2026-11-07" });
    expect(calendarKey("x", "2026-11-03", {})).toBeNull();
  });
  it("allows month steps only toward pickable days", () => {
    expect(monthStepAllowed("2026-11-15", 1)).toEqual({ prev: true, next: true });
    expect(monthStepAllowed("2026-11-15", 1, "2026-11-01", "2026-11-30")).toEqual({ prev: false, next: false });
    expect(monthStepAllowed("2026-11-15", 1, "2026-10-31", "2026-12-01")).toEqual({ prev: true, next: true });
    expect(monthStepAllowed("2026-11-15", 2, null, "2026-12-31")).toEqual({ prev: true, next: false });
  });
});
