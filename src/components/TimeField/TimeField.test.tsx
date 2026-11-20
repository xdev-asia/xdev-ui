import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const h = vi.hoisted(() => ({
  sets: [] as Array<ReturnType<typeof vi.fn>>,
  /** Initial values for the nth useState of the next render: draft, bad, seen. */
  seed: [] as unknown[],
}));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useState: (v: unknown) => {
    const i = h.sets.length;
    const set = vi.fn();
    h.sets.push(set);
    return [i in h.seed ? h.seed[i] : typeof v === "function" ? (v as () => unknown)() : v, set];
  },
}));
const { TimeField } = await import("./TimeField");

type Props = Parameters<typeof TimeField>[0];
const base = { label: "Starts at", onChange: () => {} };
const reset = (seed: unknown[] = []) => {
  h.seed = seed;
  h.sets.length = 0;
};
afterEach(() => reset());

/** Renders the element tree with draft text and the bad flag seeded; `seen` defaults to the value (no outside change). */
function tree(draft: string | null, props: Partial<Props> = {}, bad = false) {
  const value = props.value === undefined ? "09:30" : props.value;
  reset([draft, bad, value]);
  const onChange = vi.fn();
  const t = TimeField({ ...base, onChange, ...props, value });
  const input = findAll(t, (e) => e.type === "input" && e.props.type === "text")[0];
  const [setDraft, setBad, setSeen] = h.sets;
  return { t, input, onChange, setDraft, setBad, setSeen };
}
const key = (k: string, over: Record<string, unknown> = {}) => ({ key: k, altKey: false, ctrlKey: false, metaKey: false, preventDefault: vi.fn(), ...over });

describe("TimeField markup", () => {
  it("is a labelled mono numeric text box", () => {
    const html = renderToStaticMarkup(<TimeField {...base} value="09:30" />);
    expect(html).toContain('class="ws-field x-time-field"');
    expect(html).toContain('<label for="x-time-id">Starts at</label>');
    expect(html).toContain('id="x-time-id" type="text" inputMode="numeric" autoComplete="off" spellCheck="false" placeholder="hh:mm" value="09:30"');
  });
  it("uses the pattern of the mode as placeholder", () => {
    expect(renderToStaticMarkup(<TimeField {...base} value={null} seconds />)).toContain('placeholder="hh:mm:ss" value=""');
    expect(renderToStaticMarkup(<TimeField {...base} value="03:45" mode="duration" />)).toContain('placeholder="mm:ss" value="03:45"');
    // seconds only applies to time mode
    expect(renderToStaticMarkup(<TimeField {...base} value="03:45" mode="duration" seconds />)).toContain('placeholder="mm:ss"');
  });
  it("normalises the value and shows an empty box for one that does not parse", () => {
    expect(renderToStaticMarkup(<TimeField {...base} value="9:5" />)).toContain('value="09:05"');
    expect(renderToStaticMarkup(<TimeField {...base} value="25:00" />)).toContain('value=""');
    expect(renderToStaticMarkup(<TimeField {...base} value="09:30:15" />)).toContain('value=""');
  });
  it("hides the label visually with hideLabel", () => {
    expect(renderToStaticMarkup(<TimeField {...base} value={null} hideLabel />)).toContain('<label for="x-time-id" class="x-sr-only">');
  });
  it("shows hint, error, disabled and required", () => {
    const hint = renderToStaticMarkup(<TimeField {...base} value={null} hint="Local time." />);
    expect(hint).toContain('aria-describedby="x-time-id-note"');
    expect(hint).toContain('<small id="x-time-id-note">Local time.</small>');
    const err = renderToStaticMarkup(<TimeField {...base} value={null} error="Pick a start time." />);
    expect(err).toContain("data-invalid");
    expect(err).toContain('aria-invalid="true"');
    expect(err).toContain(">Pick a start time.</small>");
    const off = renderToStaticMarkup(<TimeField {...base} value={null} disabled required />);
    expect(off).toContain("data-disabled");
    expect(off).toContain('disabled="" required=""');
  });
  it("carries the committed value in a hidden input when named", () => {
    expect(renderToStaticMarkup(<TimeField {...base} value="9:30" name="start" />)).toContain('<input type="hidden" name="start" value="09:30"/>');
  });
  it("shows the typed text and the invalid label when flagged; an explicit error wins", () => {
    reset(["9:7x", true, "09:30"]);
    const html = renderToStaticMarkup(<TimeField {...base} value="09:30" labels={{ invalid: "Giờ không hợp lệ" }} />);
    expect(html).toContain('value="9:7x"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(">Giờ không hợp lệ</small>");
    reset(["9:7x", true, "09:30"]);
    const err = renderToStaticMarkup(<TimeField {...base} value="09:30" error="Server says no." />);
    expect(err).toContain(">Server says no.</small>");
    expect(err).not.toContain("Enter a valid time");
  });
});

describe("TimeField typing", () => {
  it("keeps the raw text while typing", () => {
    const { input, setDraft, setBad } = tree(null);
    input.props.onChange({ target: { value: "93" } });
    expect(setDraft).toHaveBeenCalledWith("93");
    expect(setBad).toHaveBeenCalledWith(false);
    expect(tree("93").input.props.value).toBe("93");
  });
  it("commits normalised text on blur and Enter", () => {
    let r = tree("1015");
    r.input.props.onBlur();
    expect(r.onChange).toHaveBeenCalledWith("10:15");
    expect(r.setDraft).toHaveBeenCalledWith(null);
    r = tree("7:5");
    r.input.props.onKeyDown(key("Enter"));
    expect(r.onChange).toHaveBeenCalledWith("07:05");
  });
  it("commits seconds and durations", () => {
    let r = tree("1:02:03", { value: null, seconds: true });
    r.input.props.onBlur();
    expect(r.onChange).toHaveBeenCalledWith("01:02:03");
    r = tree("130", { value: null, mode: "duration" });
    r.input.props.onBlur();
    expect(r.onChange).toHaveBeenCalledWith("01:30");
  });
  it("does not call onChange when the text normalises to the current value", () => {
    const { input, onChange, setDraft } = tree("930");
    input.props.onBlur();
    expect(onChange).not.toHaveBeenCalled();
    expect(setDraft).toHaveBeenCalledWith(null);
  });
  it("does nothing on blur without pending text", () => {
    const { input, onChange, setBad } = tree(null);
    input.props.onBlur();
    expect(onChange).not.toHaveBeenCalled();
    expect(setBad).not.toHaveBeenCalled();
  });
  it("commits null when the box is emptied", () => {
    const { input, onChange } = tree("  ");
    input.props.onBlur();
    expect(onChange).toHaveBeenCalledWith(null);
  });
  it("flags unparseable or out-of-range text and keeps it", () => {
    for (const [text, props] of [["24:00", {}], ["abc", {}], ["90", { mode: "duration" }], ["60:00", { mode: "duration" }]] as const) {
      const r = tree(text, props as Partial<Props>);
      r.input.props.onBlur();
      expect(r.onChange, text).not.toHaveBeenCalled();
      expect(r.setBad).toHaveBeenCalledWith(true);
      expect(r.setDraft).not.toHaveBeenCalled();
    }
  });
});

describe("TimeField arrows", () => {
  it("steps a minute in time mode, wrapping, and prevents the caret move", () => {
    let r = tree(null, { value: "23:59" });
    const e = key("ArrowUp");
    r.input.props.onKeyDown(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(r.onChange).toHaveBeenCalledWith("00:00");
    r = tree(null, { value: "09:30" });
    r.input.props.onKeyDown(key("ArrowDown"));
    expect(r.onChange).toHaveBeenCalledWith("09:29");
  });
  it("steps a second in duration mode", () => {
    const r = tree(null, { value: "00:59", mode: "duration" });
    r.input.props.onKeyDown(key("ArrowUp"));
    expect(r.onChange).toHaveBeenCalledWith("01:00");
  });
  it("steps from valid typed text, else the value, else 00:00", () => {
    let r = tree("1000", { value: "09:30" });
    r.input.props.onKeyDown(key("ArrowUp"));
    expect(r.onChange).toHaveBeenCalledWith("10:01");
    expect(r.setDraft).toHaveBeenCalledWith(null);
    expect(r.setBad).toHaveBeenCalledWith(false);
    r = tree("zz", { value: "09:30" });
    r.input.props.onKeyDown(key("ArrowUp"));
    expect(r.onChange).toHaveBeenCalledWith("09:31");
    r = tree(null, { value: null });
    r.input.props.onKeyDown(key("ArrowDown"));
    expect(r.onChange).toHaveBeenCalledWith("23:59");
  });
  it("ignores arrows with modifiers and other keys", () => {
    const r = tree(null);
    r.input.props.onKeyDown(key("ArrowUp", { altKey: true }));
    r.input.props.onKeyDown(key("ArrowUp", { metaKey: true }));
    r.input.props.onKeyDown(key("a"));
    expect(r.onChange).not.toHaveBeenCalled();
  });
});

describe("TimeField outside value changes", () => {
  it("drops pending text and the invalid flag when value changes", () => {
    reset(["bad", true, "09:30"]);
    const t = TimeField({ ...base, value: "11:00" });
    const [setDraft, setBad, setSeen] = h.sets;
    expect(setSeen).toHaveBeenCalledWith("11:00");
    expect(setDraft).toHaveBeenCalledWith(null);
    expect(setBad).toHaveBeenCalledWith(false);
    const input = findAll(t, (e) => e.type === "input" && e.props.type === "text")[0];
    expect(input.props.value).toBe("11:00");
    expect(input.props["aria-invalid"]).toBeUndefined();
  });
  it("keeps pending text while value is unchanged", () => {
    const { setSeen, input } = tree("bad", {}, true);
    expect(setSeen).not.toHaveBeenCalled();
    expect(input.props.value).toBe("bad");
  });
});
