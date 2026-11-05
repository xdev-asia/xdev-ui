import { describe, expect, it } from "vitest";
import { seedRoles } from "../data/seed";
import { can, canRead } from "./permissions";

const roles = seedRoles();

describe("can", () => {
  it("lets the owner do everything", () => {
    for (const c of ["users.create", "users.delete", "roles.update", "settings.update", "audit.export"] as const) expect(can(roles, "owner", c)).toBe(true);
  });
  it("follows the matrix for other roles", () => {
    expect(can(roles, "admin", "users.create")).toBe(true);
    expect(can(roles, "admin", "roles.update")).toBe(false);
    expect(can(roles, "editor", "users.update")).toBe(true);
    expect(can(roles, "editor", "users.delete")).toBe(false);
    expect(can(roles, "viewer", "users.create")).toBe(false);
    expect(can(roles, "viewer", "audit.export")).toBe(false);
  });
  it("is false for an unknown role", () => {
    expect(can(roles, "ghost" as never, "users.create")).toBe(false);
  });
  it("reads resources", () => {
    expect(canRead(roles, "viewer", "users")).toBe(true);
    expect(canRead(roles, "viewer", "audit")).toBe(false);
  });
});
