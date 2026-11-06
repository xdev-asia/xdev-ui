import { describe, expect, it } from "vitest";
import { foldText } from "../../internal/text";
import { filterFacetOptions, toggleFacetValue } from "./facet-helpers";

const options = [
  { value: "active", label: "Active", count: 40 },
  { value: "invited", label: "Invited" },
  { value: "suspended", label: "Đã tạm ngưng" },
];

describe("filterFacetOptions", () => {
  it("keeps every option for an empty or blank query, as a copy", () => {
    const out = filterFacetOptions(options, "  ");
    expect(out).toEqual(options);
    expect(out).not.toBe(options);
  });
  it("matches part of the label, ignoring case, spaces around and diacritics", () => {
    expect(filterFacetOptions(options, " IN ").map((o) => o.value)).toEqual(["invited"]);
    expect(filterFacetOptions(options, "tam ngung").map((o) => o.value)).toEqual(["suspended"]);
    expect(filterFacetOptions(options, "da").map((o) => o.value)).toEqual(["suspended"]);
    expect(filterFacetOptions(options, "zzz")).toEqual([]);
  });
  it("foldText strips marks and đ", () => expect(foldText("Đặng Tráng")).toBe("dang trang"));
});

describe("toggleFacetValue", () => {
  it("adds and removes, in option order", () => {
    expect(toggleFacetValue([], "suspended", options)).toEqual(["suspended"]);
    expect(toggleFacetValue(["suspended"], "active", options)).toEqual(["active", "suspended"]);
    expect(toggleFacetValue(["active", "suspended"], "active", options)).toEqual(["suspended"]);
  });
  it("keeps selected values that are not options", () => {
    expect(toggleFacetValue(["legacy"], "invited", options)).toEqual(["invited", "legacy"]);
  });
});
