import { describe, expect, it } from "vitest";
import { en } from "./en";
import { vi } from "./vi";
import { readLocale, translate } from "./index";
import { uiLabels } from "./xdev-ui-labels";

function flat(o: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    if (v && typeof v === "object") Object.assign(acc, flat(v as Record<string, unknown>, `${prefix}${k}.`));
    else acc[`${prefix}${k}`] = String(v);
    return acc;
  }, {});
}

describe("dictionaries", () => {
  const a = flat(en);
  const b = flat(vi);
  it("en and vi have the same keys", () => {
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
  });
  it("has no empty values", () => {
    for (const [k, v] of [...Object.entries(a), ...Object.entries(b)]) expect(v.trim(), k).not.toBe("");
  });
  it("uses the same {placeholders} in both languages", () => {
    const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const k of Object.keys(a)) expect(names(b[k]), k).toEqual(names(a[k]));
  });
  it("labels exist for both languages with the same shape", () => {
    expect(Object.keys(uiLabels.vi)).toEqual(Object.keys(uiLabels.en));
  });
});

describe("translate", () => {
  it("looks up nested keys and interpolates", () => {
    expect(translate("en", "users.status.active")).toBe("Active");
    expect(translate("vi", "users.selected", { count: 3 })).toBe("Đã chọn 3");
    expect(translate("en", "deleteUsers.titleOne", { name: "Ada" })).toBe("Delete user Ada?");
  });
  it("returns the key for an unknown path and keeps unknown placeholders", () => {
    expect(translate("en", "nope.nothing")).toBe("nope.nothing");
    expect(translate("en", "users.selected", {})).toBe("{count} selected");
  });
  it("reads a locale with a fallback", () => {
    expect(readLocale("vi")).toBe("vi");
    expect(readLocale("fr")).toBe("en");
    expect(readLocale(null)).toBe("en");
  });
});
