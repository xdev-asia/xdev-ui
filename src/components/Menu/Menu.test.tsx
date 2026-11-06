import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Menu, menuTriggerKey } from "./Menu";

interface FakeItem {
  text: string;
  disabled: boolean;
  focus: () => void;
  getAttribute: (n: string) => string | null;
  textContent: string;
}

/** Fake menu DOM: items in order, `active` is the focused one. */
function fake(entries: Array<{ text: string; disabled?: boolean }>, activeIndex = -1) {
  const focused: string[] = [];
  const items: FakeItem[] = entries.map((e) => ({
    text: e.text,
    disabled: Boolean(e.disabled),
    textContent: e.text,
    getAttribute: (n: string) => (n === "aria-disabled" && e.disabled ? "true" : null),
    focus: () => {
      focused.push(e.text);
      (globalThis as { document: unknown }).document = { activeElement: items[items.indexOf(items.find((i) => i.text === e.text) as FakeItem)] };
    },
  }));
  const enabled = items.filter((i) => !i.disabled);
  (globalThis as { document: unknown }).document = { activeElement: activeIndex >= 0 ? items[activeIndex] : null };
  const el = {
    querySelectorAll: (sel: string) => (sel.includes("aria-disabled") ? enabled : items),
  };
  return { el, items, focused };
}

function key(el: unknown, k: string, extra: Record<string, unknown> = {}) {
  const e = { key: k, currentTarget: el, preventDefault: vi.fn(), stopPropagation: vi.fn(), ...extra };
  return e;
}

const root = (props: Parameters<typeof Menu>[0]) => Menu(props);

describe("Menu", () => {
  it("renders roles, separators, checks and danger", () => {
    const html = renderToStaticMarkup(
      <Menu label="Session" items={[{ label: "Open", chord: "⏎" }, { type: "separator" }, { label: "Wrap", checked: true }, { label: "Kill", danger: true }]} />,
    );
    expect(html).toContain('role="menu"');
    expect(html).toContain('role="separator"');
    expect(html).toContain('role="menuitemcheckbox"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain("data-danger");
    expect(html).toContain('tabindex="-1"');
  });
  it("does not wire disabled items", () => {
    const onSelect = vi.fn();
    const btns = findAll(Menu({ items: [{ label: "A", onSelect }, { label: "B", onSelect, disabled: true }] }), (e) => e.type === "button");
    btns[0].props.onClick({ currentTarget: { closest: () => null } });
    expect(btns[1].props.onClick).toBeUndefined();
    expect(onSelect).toHaveBeenCalledOnce();
  });
  it("maps trigger keys to the item the menu opens on", () => {
    expect(menuTriggerKey("Enter")).toBe("first");
    expect(menuTriggerKey(" ")).toBe("first");
    expect(menuTriggerKey("ArrowDown")).toBe("first");
    expect(menuTriggerKey("ArrowUp")).toBe("last");
    expect(menuTriggerKey("a")).toBeNull();
  });
  it("focuses the first item on mount, the last with initialFocus last, none with false", () => {
    for (const [initialFocus, want] of [["first", "A"], ["last", "C"], [false, undefined]] as const) {
      const { el, focused } = fake([{ text: "A" }, { text: "B", disabled: true }, { text: "C" }]);
      root({ items: [], initialFocus }).props.ref(el);
      expect(focused[0]).toBe(want);
    }
  });
  it("wraps with Up/Down, skips disabled items, supports Home/End", () => {
    const menu = root({ items: [] });
    const { el, focused } = fake([{ text: "A" }, { text: "B", disabled: true }, { text: "C" }], 2);
    const down = key(el, "ArrowDown");
    menu.props.onKeyDown(down);
    expect(focused.at(-1)).toBe("A");
    expect(down.preventDefault).toHaveBeenCalled();
    menu.props.onKeyDown(key(el, "ArrowUp"));
    expect(focused.at(-1)).toBe("C");
    menu.props.onKeyDown(key(el, "Home"));
    expect(focused.at(-1)).toBe("A");
    menu.props.onKeyDown(key(el, "End"));
    expect(focused.at(-1)).toBe("C");
  });
  it("jumps to the next item starting with the typed character", () => {
    const menu = root({ items: [] });
    const { el, focused } = fake([{ text: "Rename" }, { text: "Resume", disabled: true }, { text: "Split" }, { text: "Reset" }], 0);
    menu.props.onKeyDown(key(el, "s"));
    expect(focused.at(-1)).toBe("Split");
    menu.props.onKeyDown(key(el, "r"));
    expect(focused.at(-1)).toBe("Reset");
  });
  it("Esc returns focus to the trigger and closes; Tab only closes", () => {
    const onClose = vi.fn();
    const trigger = { focus: vi.fn() };
    const menu = root({ items: [], initialFocus: false, onClose });
    const { el } = fake([{ text: "A" }]);
    (globalThis as { document: unknown }).document = { activeElement: trigger };
    menu.props.ref(el);
    const esc = key(el, "Escape");
    menu.props.onKeyDown(esc);
    expect(esc.preventDefault).toHaveBeenCalled();
    expect(esc.stopPropagation).toHaveBeenCalled();
    expect(trigger.focus).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledTimes(1);
    const tab = key(el, "Tab");
    menu.props.onKeyDown(tab);
    expect(tab.preventDefault).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
