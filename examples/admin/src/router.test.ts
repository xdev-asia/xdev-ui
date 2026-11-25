import { describe, expect, it } from "vitest";
import { hrefFor, matchRoute } from "./router";

describe("matchRoute", () => {
  it("matches static routes with or without the hash", () => {
    expect(matchRoute("").name).toBe("dashboard");
    expect(matchRoute("#/").name).toBe("dashboard");
    expect(matchRoute("#/users").name).toBe("users");
    expect(matchRoute("/audit/").name).toBe("audit");
    expect(matchRoute("#/sign-in").name).toBe("sign-in");
  });
  it("reads params", () => {
    expect(matchRoute("#/users/u12")).toMatchObject({ name: "user", params: { id: "u12" } });
    expect(matchRoute("#/settings/security")).toMatchObject({ name: "settings", params: { section: "security" } });
    expect(matchRoute("#/users/a%20b").params.id).toBe("a b");
  });
  it("treats a malformed escape as not-found instead of throwing", () => {
    expect(matchRoute("#/users/%E0").name).toBe("not-found");
    expect(matchRoute("#/settings/%E0%A4%A").name).toBe("not-found");
  });
  it("ignores a query string", () => {
    expect(matchRoute("#/users?role=admin").name).toBe("users");
  });
  it("falls back to not-found", () => {
    expect(matchRoute("#/nope").name).toBe("not-found");
    expect(matchRoute("#/users/a/b").name).toBe("not-found");
  });
  it("matches the showcase pages, status pages and nested demo leaves", () => {
    for (const n of ["menus", "departments", "profile", "about", "devices"]) expect(matchRoute(`#/${n}`).name).toBe(n);
    expect(matchRoute(hrefFor.access("buttons"))).toMatchObject({ name: "access", params: { page: "buttons" } });
    expect(matchRoute("#/access/nope").name).toBe("not-found");
    expect(matchRoute(hrefFor.embed("storybook"))).toMatchObject({ name: "embed", params: { id: "storybook" } });
    expect(matchRoute(hrefFor.legal("terms"))).toMatchObject({ name: "legal", params: { page: "terms" } });
    expect(matchRoute(hrefFor.unknown())).toMatchObject({ name: "exception", params: { code: "unknown" } });
    expect(matchRoute(hrefFor.exception("403"))).toMatchObject({ name: "exception", params: { code: "403" } });
    expect(matchRoute("#/exception/418").name).toBe("not-found");
    expect(matchRoute(hrefFor.nested("menu1-2"))).toMatchObject({ name: "nested", params: { leaf: "menu1-2" } });
    expect(matchRoute("#/nested/menu9").name).toBe("not-found");
  });
  it("builds hrefs that match back", () => {
    expect(matchRoute(hrefFor.user("u 1")).params.id).toBe("u 1");
    expect(matchRoute(hrefFor.settings("general")).name).toBe("settings");
  });
});
