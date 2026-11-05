import { describe, expect, it } from "vitest";
import { matchRoute } from "../skills/xdev-ui-admin/templates/admin/src/router";

describe("admin template router", () => {
  it("decodes an item id", () => {
    expect(matchRoute("#/items/a%20b")).toEqual({ name: "item", params: { id: "a b" } });
  });
  it("treats a malformed escape as not-found instead of throwing", () => {
    expect(matchRoute("#/items/%E0")).toEqual({ name: "not-found", params: {} });
  });
  it("matches static routes and falls back to not-found", () => {
    expect(matchRoute("#/settings").name).toBe("settings");
    expect(matchRoute("#main").name).toBe("not-found");
  });
});
