export type RoleId = "owner" | "admin" | "editor" | "viewer";
export type UserStatus = "active" | "invited" | "suspended";
export type Action = "read" | "create" | "update" | "delete";
export type Resource = "users" | "roles" | "audit" | "settings";
export type AuditKind = "signIn" | "userCreate" | "userUpdate" | "userDelete" | "roleUpdate";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  status: UserStatus;
  notify: boolean;
  /** ISO timestamp, or null when the user never signed in. */
  lastSeen: string | null;
  created: string;
}
export interface Role {
  id: RoleId;
  permissions: Record<Resource, Record<Action, boolean>>;
}
export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  kind: AuditKind;
  target: string;
  ip: string;
}

export const ROLE_IDS: RoleId[] = ["owner", "admin", "editor", "viewer"];
export const RESOURCES: Resource[] = ["users", "roles", "audit", "settings"];
export const ACTIONS: Action[] = ["read", "create", "update", "delete"];

const FIRST = ["Ada", "Grace", "Linus", "Margaret", "Alan", "Edsger", "Barbara", "Dennis", "Ken", "Radia", "Hedy", "Tim", "Anita", "Guido", "Brendan", "Lea", "Minh", "Lan", "Hùng", "Trang"];
const LAST = ["Lovelace", "Hopper", "Torvalds", "Hamilton", "Turing", "Dijkstra", "Liskov", "Ritchie", "Thompson", "Perlman", "Lamarr", "Berners-Lee", "Borg", "van Rossum", "Eich", "Verou", "Nguyễn", "Trần", "Lê", "Phạm"];

/** Small deterministic generator, so tests and screenshots always see the same data. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const ascii = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z]/gi, "").toLowerCase();
const NOW = Date.UTC(2026, 10, 4, 9, 0, 0);
const DAY = 86_400_000;

export function seedUsers(): User[] {
  const rnd = lcg(42);
  const users: User[] = [
    { id: "u1", name: "Ada Lovelace", email: "admin@example.com", role: "owner", status: "active", notify: true, lastSeen: new Date(NOW - 3_600_000).toISOString(), created: new Date(NOW - 400 * DAY).toISOString() },
    { id: "u2", name: "Grace Hopper", email: "viewer@example.com", role: "viewer", status: "active", notify: false, lastSeen: new Date(NOW - 2 * DAY).toISOString(), created: new Date(NOW - 300 * DAY).toISOString() },
  ];
  for (let i = 3; i <= 57; i++) {
    const name = `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`;
    const r = rnd();
    const status: UserStatus = r < 0.7 ? "active" : r < 0.85 ? "invited" : "suspended";
    const role: RoleId = i % 11 === 0 ? "admin" : i % 3 === 0 ? "editor" : "viewer";
    users.push({
      id: `u${i}`,
      name,
      email: `${ascii(name)}${i}@example.com`,
      role,
      status,
      notify: rnd() > 0.5,
      lastSeen: status === "invited" ? null : new Date(NOW - Math.floor(rnd() * 60 * DAY)).toISOString(),
      created: new Date(NOW - Math.floor(30 + rnd() * 360) * DAY).toISOString(),
    });
  }
  return users;
}

const all = (v: boolean): Record<Action, boolean> => ({ read: v, create: v, update: v, delete: v });
const some = (read: boolean, create: boolean, update: boolean, del: boolean): Record<Action, boolean> => ({ read, create, update, delete: del });

export function seedRoles(): Role[] {
  return [
    { id: "owner", permissions: { users: all(true), roles: all(true), audit: all(true), settings: all(true) } },
    { id: "admin", permissions: { users: all(true), roles: some(true, false, false, false), audit: some(true, false, false, false), settings: some(true, false, true, false) } },
    { id: "editor", permissions: { users: some(true, false, true, false), roles: all(false), audit: some(true, false, false, false), settings: all(false) } },
    { id: "viewer", permissions: { users: some(true, false, false, false), roles: all(false), audit: all(false), settings: all(false) } },
  ];
}

const KINDS: AuditKind[] = ["signIn", "signIn", "userUpdate", "userCreate", "roleUpdate", "userDelete"];

export function seedAudit(users: User[]): AuditEvent[] {
  const rnd = lcg(7);
  const events: AuditEvent[] = [];
  for (let i = 0; i < 120; i++) {
    const actor = users[Math.floor(rnd() * 12)];
    const kind = KINDS[Math.floor(rnd() * KINDS.length)];
    const target = kind === "signIn" ? "console" : kind === "roleUpdate" ? ROLE_IDS[Math.floor(rnd() * 4)] : users[Math.floor(rnd() * users.length)].email;
    events.push({
      id: `e${i + 1}`,
      time: new Date(NOW - i * 2.2 * 3_600_000).toISOString(),
      actor: actor.name,
      kind,
      target,
      ip: `10.0.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}`,
    });
  }
  return events;
}

/** "Now" of the demo data; pages format relative times against it, not the clock. */
export const DEMO_NOW = NOW;
