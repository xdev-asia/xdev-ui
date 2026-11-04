import { seedAudit, seedRoles, seedUsers, ROLE_IDS, type AuditEvent, type Role, type RoleId, type User, type UserStatus } from "./seed";

export type Resource = "users" | "roles" | "audit" | "dashboard" | "save";
export type StoreErrorCode = "failed" | "not-found" | "email-taken";

export class StoreError extends Error {
  constructor(public code: StoreErrorCode) {
    super(code);
  }
}

export interface StoreOptions {
  /** Milliseconds every call waits; 0 in tests. */
  latency?: number;
  /** Resources whose calls reject with `failed`, e.g. from `?fail=users`. */
  fail?: Iterable<Resource>;
}

export interface NewUser {
  name: string;
  email: string;
  role: RoleId;
  invite: boolean;
}

export interface DashboardData {
  activeUsers: number;
  signIns: number;
  failedSignIns: number;
  storageGb: number;
  byRole: { role: RoleId; count: number }[];
  recent: AuditEvent[];
}

export interface Store {
  listUsers(): Promise<User[]>;
  getUser(id: string): Promise<User>;
  createUser(input: NewUser): Promise<User>;
  updateUser(id: string, patch: Partial<Pick<User, "name" | "email" | "role" | "notify">>): Promise<User>;
  setStatus(ids: string[], status: UserStatus): Promise<void>;
  deleteUsers(ids: string[]): Promise<void>;
  listRoles(): Promise<Role[]>;
  saveRole(role: Role): Promise<Role>;
  listAudit(): Promise<AuditEvent[]>;
  dashboard(): Promise<DashboardData>;
}

const clone = <T,>(v: T): T => structuredClone(v);

export function createStore(options: StoreOptions = {}): Store {
  const fail = new Set(options.fail ?? []);
  const latency = options.latency ?? 0;
  let users = seedUsers();
  let roles = seedRoles();
  const audit = seedAudit(users);
  let nextId = users.length + 1;

  const run = async <T,>(resource: Resource, fn: () => T): Promise<T> => {
    if (latency) await new Promise((r) => setTimeout(r, latency));
    if (fail.has(resource)) throw new StoreError("failed");
    return clone(fn());
  };
  const find = (id: string): User => {
    const u = users.find((x) => x.id === id);
    if (!u) throw new StoreError("not-found");
    return u;
  };
  const emailTaken = (email: string, except?: string): boolean => users.some((u) => u.id !== except && u.email.toLowerCase() === email.toLowerCase());

  return {
    listUsers: () => run("users", () => users),
    getUser: (id) => run("users", () => find(id)),
    createUser: (input) =>
      run("save", () => {
        if (emailTaken(input.email)) throw new StoreError("email-taken");
        const u: User = { id: `u${nextId++}`, name: input.name, email: input.email, role: input.role, status: input.invite ? "invited" : "active", notify: true, lastSeen: null, created: new Date(2026, 10, 4).toISOString() };
        users = [u, ...users];
        return u;
      }),
    updateUser: (id, patch) =>
      run("save", () => {
        const u = find(id);
        if (patch.email && emailTaken(patch.email, id)) throw new StoreError("email-taken");
        Object.assign(u, patch);
        return u;
      }),
    setStatus: (ids, status) =>
      run("save", () => {
        for (const id of ids) find(id).status = status;
      }),
    deleteUsers: (ids) =>
      run("save", () => {
        users = users.filter((u) => !ids.includes(u.id));
      }),
    listRoles: () => run("roles", () => roles),
    saveRole: (role) =>
      run("save", () => {
        if (role.id === "owner") throw new StoreError("failed");
        roles = roles.map((r) => (r.id === role.id ? role : r));
        return role;
      }),
    listAudit: () => run("audit", () => audit),
    dashboard: () =>
      run("dashboard", () => ({
        activeUsers: users.filter((u) => u.status === "active").length,
        signIns: audit.filter((e) => e.kind === "signIn").length,
        failedSignIns: 7,
        storageGb: 82,
        byRole: ROLE_IDS.map((role) => ({ role, count: users.filter((u) => u.role === role).length })),
        recent: audit.slice(0, 5),
      })),
  };
}

/** The app's store; `?fail=users,audit` in the URL makes those resources fail, `?latency=400` slows every call. */
export function storeFromLocation(search: string): Store {
  const q = new URLSearchParams(search);
  return createStore({ latency: Number(q.get("latency") ?? 250), fail: (q.get("fail") ?? "").split(",").filter(Boolean) as Resource[] });
}
