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
  it("ignores a query string", () => {
    expect(matchRoute("#/users?role=admin").name).toBe("users");
  });
  it("falls back to not-found", () => {
    expect(matchRoute("#/nope").name).toBe("not-found");
    expect(matchRoute("#/users/a/b").name).toBe("not-found");
  });
  it("builds hrefs that match back", () => {
    expect(matchRoute(hrefFor.user("u 1")).params.id).toBe("u 1");
    expect(matchRoute(hrefFor.settings("general")).name).toBe("settings");
  });
});
