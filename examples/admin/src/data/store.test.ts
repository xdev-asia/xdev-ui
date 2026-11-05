import { describe, expect, it } from "vitest";
import { seedAudit, seedUsers } from "./seed";
import { createStore, StoreError, storeFromLocation } from "./store";

describe("seed", () => {
  it("is deterministic with 57 users and 120 events", () => {
    const a = seedUsers();
    expect(a).toHaveLength(57);
    expect(seedUsers()).toEqual(a);
    expect(seedAudit(a)).toHaveLength(120);
    expect(new Set(a.map((u) => u.email)).size).toBe(57);
  });
});

describe("store", () => {
  it("lists, creates and rejects a duplicate email", async () => {
    const s = createStore();
    const u = await s.createUser({ name: "New Person", email: "new@example.com", role: "viewer", invite: true });
    expect(u.status).toBe("invited");
    expect((await s.listUsers())[0].id).toBe(u.id);
    await expect(s.createUser({ name: "Dup", email: "NEW@example.com", role: "viewer", invite: false })).rejects.toMatchObject({ code: "email-taken" });
  });
  it("updates, suspends and deletes", async () => {
    const s = createStore();
    await s.updateUser("u3", { name: "Renamed" });
    expect((await s.getUser("u3")).name).toBe("Renamed");
    await s.setStatus(["u3", "u4"], "suspended");
    expect((await s.getUser("u4")).status).toBe("suspended");
    await s.deleteUsers(["u3"]);
    await expect(s.getUser("u3")).rejects.toBeInstanceOf(StoreError);
    expect(await s.listUsers()).toHaveLength(56);
  });
  it("returns copies, not live rows", async () => {
    const s = createStore();
    const u = await s.getUser("u1");
    u.name = "Changed";
    expect((await s.getUser("u1")).name).toBe("Ada Lovelace");
  });
  it("keeps the owner role read-only", async () => {
    const s = createStore();
    const [owner] = await s.listRoles();
    await expect(s.saveRole(owner)).rejects.toMatchObject({ code: "failed" });
  });
  it("fails only the named resources", async () => {
    const s = createStore({ fail: ["users"] });
    await expect(s.listUsers()).rejects.toMatchObject({ code: "failed" });
    await expect(s.listAudit()).resolves.toHaveLength(120);
  });
  it("summarises the dashboard", async () => {
    const d = await createStore().dashboard();
    expect(d.byRole.reduce((n, r) => n + r.count, 0)).toBe(57);
    expect(d.recent).toHaveLength(5);
  });
  it("reads failure injection and latency from the query string", async () => {
    const s = storeFromLocation("?fail=users,audit&latency=0");
    await expect(s.listAudit()).rejects.toBeInstanceOf(StoreError);
    await expect(s.listRoles()).resolves.toHaveLength(4);
  });
});
