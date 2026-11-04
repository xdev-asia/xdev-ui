import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SearchPicker, searchPickerKey, type SearchPickerItem } from "./SearchPicker";

const items: SearchPickerItem[] = [
  { id: "a", title: "Alpha", meta: "first" },
  { id: "b", title: "Beta", disabled: true },
  { id: "c", title: "Gamma" },
];

describe("SearchPicker", () => {
  it("is a combobox over a listbox with options, the first enabled one active", () => {
    const html = renderToStaticMarkup(<SearchPicker label="Find work" value="" onValueChange={() => {}} items={items} onPick={() => {}} />);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('role="listbox"');
    expect(html.match(/role="option"/g)).toHaveLength(3);
    expect(html).toContain('aria-label="Find work"');
    const active = /aria-activedescendant="([^"]+)"/.exec(html)?.[1];
    expect(active).toBeTruthy();
    expect(html).toContain(`id="${active}"`);
    expect(html).toContain('aria-selected="true"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("first");
  });

  it("announces the status line and hides an empty list", () => {
    const html = renderToStaticMarkup(<SearchPicker label="Find" value="x" onValueChange={() => {}} items={[]} onPick={() => {}} status="No matches" />);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("No matches");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/role="listbox"[^>]*hidden/);
  });

  it("has English defaults that labels override", () => {
    const html = renderToStaticMarkup(<SearchPicker label="Find" value="x" onValueChange={() => {}} items={[]} onPick={() => {}} />);
    expect(html).toContain('aria-label="Clear search"');
    const vi = renderToStaticMarkup(<SearchPicker label="Tim" value="x" onValueChange={() => {}} items={[]} onPick={() => {}} labels={{ clear: "Xoa" }} />);
    expect(vi).toContain('aria-label="Xoa"');
    expect(vi).not.toContain("Clear search");
  });
});

describe("searchPickerKey", () => {
  it("moves over enabled options only and stops at the ends", () => {
    expect(searchPickerKey(items, "a", "ArrowDown", "").active).toBe("c");
    expect(searchPickerKey(items, "c", "ArrowDown", "").active).toBe("c");
    expect(searchPickerKey(items, "c", "ArrowUp", "").active).toBe("a");
    expect(searchPickerKey(items, "a", "ArrowUp", "").active).toBe("a");
  });
  it("picks the active option on Enter and nothing from an empty list", () => {
    expect(searchPickerKey(items, "c", "Enter", "").pick).toBe("c");
    expect(searchPickerKey(items, null, "Enter", "").pick).toBe("a");
    expect(searchPickerKey([], null, "Enter", "").pick).toBeNull();
    expect(searchPickerKey([{ id: "x", title: "X", disabled: true }], null, "Enter", "").pick).toBeNull();
  });
  it("clears a query on Escape and leaves an empty box to the parent", () => {
    expect(searchPickerKey(items, "a", "Escape", "al").clear).toBe(true);
    expect(searchPickerKey(items, "a", "Escape", "").clear).toBe(false);
  });
});
