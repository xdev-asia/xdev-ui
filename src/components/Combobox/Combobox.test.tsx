import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Tag } from "../Tag/Tag";

const h = vi.hoisted(() => ({ states: [] as Array<{ value: unknown; set: (v: unknown) => void }> }));
vi.mock("react", async (orig) => {
  const React = await orig<typeof import("react")>();
  return {
    ...React,
    useId: () => "id",
    useState: (init: unknown) => {
      const cell = { value: typeof init === "function" ? (init as () => unknown)() : init, set: vi.fn() };
      h.states.push(cell);
      return [cell.value, cell.set];
    },
  };
});
const { Combobox, COMBOBOX_CREATE, comboboxFilter, comboboxKey, comboboxRows, foldText } = await import("./Combobox");
type Opt = import("./Combobox").ComboboxOption;

const options: Opt[] = [
  { value: "hn", label: "Hà Nội", meta: "Capital" },
  { value: "hcm", label: "Hồ Chí Minh", disabled: true },
  { value: "dn", label: "Đà Nẵng" },
];

describe("filter", () => {
  it("folds case and Vietnamese diacritics, đ to d", () => {
    expect(foldText("Đà Nẵng")).toBe("da nang");
    expect(comboboxFilter({ label: "Hà Nội" }, "ha noi")).toBe(true);
    expect(comboboxFilter({ label: "Đà Nẵng" }, "  ĐA ")).toBe(true);
    expect(comboboxFilter({ label: "Hà Nội" }, "nang")).toBe(false);
  });
  it("lists every option for an empty query and matches otherwise", () => {
    expect(comboboxRows(options, "").map((r) => r.id)).toEqual(["hn", "hcm", "dn"]);
    expect(comboboxRows(options, "ho").map((r) => r.id)).toEqual(["hcm"]);
    expect(comboboxRows(options, "x", { filter: () => true })).toHaveLength(3);
  });
  it("adds a Create row only when creating is allowed and nothing matches exactly", () => {
    expect(comboboxRows(options, "Huế", { canCreate: true }).map((r) => r.id)).toEqual([COMBOBOX_CREATE]);
    expect(comboboxRows(options, "ha noi", { canCreate: true }).map((r) => r.id)).toEqual(["hn"]);
    expect(comboboxRows(options, "ha", { canCreate: true }).at(-1)).toMatchObject({ kind: "create", text: "ha" });
    expect(comboboxRows(options, "  ", { canCreate: true })).toHaveLength(3);
    expect(comboboxRows(options, "Huế")).toHaveLength(0);
  });
});

describe("comboboxKey", () => {
  const rows = comboboxRows(options, "");
  const s = { rows, active: "hn", open: true, text: "", multiple: false, hasValue: false };
  it("moves over enabled rows, wraps, and goes to the ends", () => {
    expect(comboboxKey(s, "ArrowDown").active).toBe("dn");
    expect(comboboxKey({ ...s, active: "dn" }, "ArrowDown").active).toBe("hn");
    expect(comboboxKey(s, "ArrowUp").active).toBe("dn");
    expect(comboboxKey({ ...s, active: "dn" }, "Home").active).toBe("hn");
    expect(comboboxKey(s, "End").active).toBe("dn");
    expect(comboboxKey(s, "ArrowDown").handled).toBe(true);
  });
  it("opens on an arrow when closed; Home/End then belong to the text", () => {
    expect(comboboxKey({ ...s, open: false, active: null }, "ArrowDown")).toMatchObject({ open: true, active: "hn", handled: true });
    expect(comboboxKey({ ...s, open: false, active: null }, "ArrowUp")).toMatchObject({ open: true, active: "dn" });
    expect(comboboxKey({ ...s, open: false }, "Home").handled).toBe(false);
  });
  it("picks the active row on Enter, nothing when closed or empty", () => {
    expect(comboboxKey(s, "Enter")).toMatchObject({ pick: "hn", handled: true });
    expect(comboboxKey({ ...s, open: false }, "Enter").pick).toBeNull();
    expect(comboboxKey({ ...s, rows: [], active: null }, "Enter").pick).toBeNull();
    expect(comboboxKey({ ...s, active: "hcm" }, "Enter").pick).toBeNull();
  });
  it("Escape closes, then clears the text, then reaches the parent", () => {
    expect(comboboxKey({ ...s, text: "ha" }, "Escape")).toMatchObject({ open: false, clear: false, stop: true });
    expect(comboboxKey({ ...s, open: false, text: "ha" }, "Escape")).toMatchObject({ clear: true, stop: true });
    expect(comboboxKey({ ...s, open: false, hasValue: true }, "Escape").clear).toBe(true);
    expect(comboboxKey({ ...s, open: false, multiple: true, hasValue: true }, "Escape")).toMatchObject({ clear: false, stop: false, handled: false });
  });
  it("Backspace on an empty box removes the last chip; Tab closes without being handled", () => {
    expect(comboboxKey({ ...s, multiple: true, hasValue: true }, "Backspace").removeLast).toBe(true);
    expect(comboboxKey({ ...s, multiple: true, hasValue: true, text: "a" }, "Backspace").removeLast).toBe(false);
    expect(comboboxKey({ ...s, hasValue: true }, "Backspace").removeLast).toBe(false);
    expect(comboboxKey(s, "Tab")).toMatchObject({ open: false, handled: false });
  });
});

describe("Combobox", () => {
  it("follows the WAI-ARIA combobox pattern with a visible label", () => {
    const html = renderToStaticMarkup(<Combobox label="City" options={options} value="dn" onChange={() => {}} defaultOpen />);
    expect(html).toContain('<label class="x-combobox-label" for="x-combobox-id-input">City</label>');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="x-combobox-id-list"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain('aria-activedescendant="x-combobox-id-opt-2"');
    expect(html).toContain('id="x-combobox-id-opt-2"');
    expect(html).toContain('role="listbox"');
    expect(html.match(/role="option"/g)).toHaveLength(3);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('value="Đà Nẵng"');
    expect(html).toContain("Capital");
    expect(html).not.toContain("aria-multiselectable");
  });
  it("is closed by default; hideLabel moves the label to aria-label", () => {
    const html = renderToStaticMarkup(<Combobox label="City" hideLabel options={options} value={null} onChange={() => {}} placeholder="Pick" />);
    expect(html).not.toContain("<label");
    expect(html).toContain('aria-label="City"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("aria-activedescendant");
    expect(html).toMatch(/role="listbox"[^>]*hidden/);
    expect(html).toContain('placeholder="Pick"');
  });
  it("passes invalid, aria-describedby and disabled through", () => {
    const html = renderToStaticMarkup(<Combobox label="City" options={options} value="hn" onChange={() => {}} invalid aria-describedby="err" disabled defaultOpen />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="err"');
    expect(html).toContain("data-invalid");
    expect(html).toMatch(/<input[^>]*disabled/);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('aria-label="Clear"');
  });
  it("multiple shows removable chips, aria-multiselectable and chosen options as selected", () => {
    const onChange = vi.fn();
    const html = renderToStaticMarkup(<Combobox label="Cities" multiple options={options} value={["hn", "dn"]} onChange={onChange} defaultOpen />);
    expect(html).toContain('aria-multiselectable="true"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Remove Hà Nội"');
    expect(html).toContain('aria-label="Clear"');
    const tags = findAll(Combobox({ label: "Cities", multiple: true, options, value: ["hn", "dn"], onChange }), (e) => e.type === Tag);
    expect(tags).toHaveLength(2);
    tags[0].props.onRemove();
    expect(onChange).toHaveBeenCalledWith(["dn"]);
  });
  it("picks on click: single closes, multiple toggles and keeps the list open", () => {
    h.states.length = 0;
    const single = vi.fn();
    const tree = Combobox({ label: "City", options, value: null, onChange: single, defaultOpen: true });
    findAll(tree, (e) => e.props.role === "option")[2].props.onClick();
    expect(single).toHaveBeenCalledWith("dn");
    expect(h.states[0].set).toHaveBeenCalledWith(false);

    h.states.length = 0;
    const multi = vi.fn();
    const tree2 = Combobox({ label: "Cities", multiple: true, options, value: ["hn"], onChange: multi, defaultOpen: true });
    const opts = findAll(tree2, (e) => e.props.role === "option");
    opts[0].props.onClick();
    expect(multi).toHaveBeenLastCalledWith([]);
    opts[2].props.onClick();
    expect(multi).toHaveBeenLastCalledWith(["hn", "dn"]);
    opts[1].props.onClick();
    expect(multi).toHaveBeenCalledTimes(2);
    expect(h.states[0].set).not.toHaveBeenCalledWith(false);
  });
  it("Backspace on the empty box drops the last chip; Enter picks the active option", () => {
    const multi = vi.fn();
    const input = findAll(Combobox({ label: "Cities", multiple: true, options, value: ["hn", "dn"], onChange: multi, defaultOpen: true }), (e) => e.props.role === "combobox")[0];
    const ev = (key: string) => ({ key, preventDefault: vi.fn(), stopPropagation: vi.fn() });
    const bs = ev("Backspace");
    input.props.onKeyDown(bs);
    expect(multi).toHaveBeenLastCalledWith(["hn"]);
    expect(bs.preventDefault).toHaveBeenCalled();
    input.props.onKeyDown(ev("Enter"));
    expect(multi).toHaveBeenLastCalledWith(["dn"]);
  });
  it("has English defaults that labels override", () => {
    const html = renderToStaticMarkup(<Combobox label="x" multiple options={options} value={["hn"]} onChange={() => {}} />);
    expect(html).toContain('aria-label="Clear"');
    const vi_ = renderToStaticMarkup(
      <Combobox label="x" multiple options={options} value={["hn"]} onChange={() => {}} labels={{ clear: "Xoá hết", remove: (t) => `Bỏ ${t}` }} />,
    );
    expect(vi_).toContain('aria-label="Xoá hết"');
    expect(vi_).toContain('aria-label="Bỏ Hà Nội"');
    expect(vi_).not.toContain("Remove");
  });
});
