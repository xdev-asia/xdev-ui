import type { Action, Resource, Role, RoleId } from "../data/seed";

/** What the console checks before it shows a control. The server must check again; this only shapes the UI. */
export type Capability =
  | "users.create"
  | "users.update"
  | "users.delete"
  | "roles.update"
  | "settings.update"
  | "audit.export";

const MAP: Record<Capability, [Resource, Action]> = {
  "users.create": ["users", "create"],
  "users.update": ["users", "update"],
  "users.delete": ["users", "delete"],
  "roles.update": ["roles", "update"],
  "settings.update": ["settings", "update"],
  "audit.export": ["audit", "read"],
};

/** True when the role's matrix grants the capability. The owner can always do everything. */
export function can(roles: Role[], role: RoleId, capability: Capability): boolean {
  if (role === "owner") return true;
  const [resource, action] = MAP[capability];
  return roles.find((r) => r.id === role)?.permissions[resource][action] ?? false;
}

export function canRead(roles: Role[], role: RoleId, resource: Resource): boolean {
  return role === "owner" || (roles.find((r) => r.id === role)?.permissions[resource].read ?? false);
}
