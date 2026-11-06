import { describe, expect, it } from "vitest";
import { linkAction } from "./LinkForm";

describe("linkAction", () => {
  it("refuses unsafe addresses", () => {
    expect(linkAction("javascript:alert(1)", { empty: false, inLink: false })).toBe("invalid");
    expect(linkAction("example.com", { empty: true, inLink: false })).toBe("invalid");
  });
  it("inserts the address as text when nothing is selected and the cursor is not in a link", () => {
    expect(linkAction("https://xdev.asia", { empty: true, inLink: false })).toBe("insert");
  });
  it("links the selection or updates the link under the cursor", () => {
    expect(linkAction("https://xdev.asia", { empty: false, inLink: false })).toBe("set");
    expect(linkAction("https://xdev.asia", { empty: true, inLink: true })).toBe("set");
  });
});
